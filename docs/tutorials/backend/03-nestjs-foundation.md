# B-03: Configure NestJS — Database, CORS, Swagger, Guards

> **Goal:** Wire up NestJS to connect to Supabase PostgreSQL and configure core infrastructure.  
> **Time Estimate:** 1 hour  
> **Prerequisites:** [B-02 — Database Schema Setup](./02-database-schema-setup.md)

---

## What You'll Learn

- How NestJS connects to PostgreSQL via TypeORM
- How `ConfigModule` reads `.env` files
- How global guards protect every route
- How Swagger auto-generates API documentation

---

## What is NestJS? (Quick Recap)

NestJS is the **API server** (the "brain") that sits between your frontend and Supabase:

```
Frontend (Next.js) → NestJS (API Server) → Supabase (PostgreSQL)
```

It handles business logic, validation, and authorization that is too complex for the frontend.

---

## Step 1: Update `database.config.ts`

**File:** `apps/backend/src/config/database.config.ts`

Replace the entire file with:

```typescript
/**
 * Database Configuration
 * Reads DATABASE_URL from .env and configures TypeORM.
 */
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));
```

> **Why?** Supabase requires SSL in production. The `ssl` option handles this automatically.

---

## Step 2: Update `supabase.config.ts`

**File:** `apps/backend/src/config/supabase.config.ts`

Replace with:

```typescript
/**
 * Supabase Configuration
 * Provides Supabase credentials to any module that needs them.
 */
import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
}));
```

---

## Step 3: Update `app.module.ts`

**File:** `apps/backend/src/app.module.ts`

This is the root module that wires everything together. Update the `TypeOrmModule` config:

```typescript
/**
 * Root Application Module
 * Imports all feature modules and configures global providers.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Config files
import databaseConfig from './config/database.config';
import supabaseConfig from './config/supabase.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { AdminsModule } from './modules/admins/admins.module';
import { ClientsModule } from './modules/clients/clients.module';
import { TaskersModule } from './modules/taskers/taskers.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TimesheetsModule } from './modules/timesheets/timesheets.module';
import { DashboardAnalyticsModule } from './modules/dashboard-analytics/dashboard-analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ExportsModule } from './modules/exports/exports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { HealthModule } from './modules/health/health.module';

// Common providers
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // Load .env and config files globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, supabaseConfig],
    }),

    // Connect to Supabase PostgreSQL via TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: config.get<string>('app.nodeEnv') !== 'production',
        ssl: config.get<string>('app.nodeEnv') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProfilesModule,
    AdminsModule,
    ClientsModule,
    TaskersModule,
    ProjectsModule,
    AccountsModule,
    TimesheetsModule,
    DashboardAnalyticsModule,
    ReportsModule,
    ExportsModule,
    NotificationsModule,
    AuditLogsModule,
    RolesModule,
    PermissionsModule,
    SupabaseModule,
    HealthModule,
  ],
  providers: [
    // Global guards: JWT → Roles → Permissions (applied to every route)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },

    // Global interceptor: wraps all responses in { success, data } format
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

    // Global filter: catches all exceptions and returns consistent error format
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
```

---

## Step 4: Update `app.config.ts`

**File:** `apps/backend/src/config/app.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
```

---

## Step 5: Update `jwt.config.ts`

**File:** `apps/backend/src/config/jwt.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
```

---

## Step 6: Update `main.ts`

**File:** `apps/backend/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global validation pipe — strips unknown fields, transforms types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API documentation at /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Annotator Platform API')
    .setDescription('Staff & Tasker Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // CORS — allow frontend to call the API
  app.enableCors({
    origin: config.get<string>('app.frontendUrl'),
    credentials: true,
  });

  // All routes prefixed with /api/v1
  app.setGlobalPrefix('api/v1');

  const port = config.get<number>('app.port');
  await app.listen(port);
  console.log(`🚀 API running at http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
```

---

## Step 7: Test the Connection

Start the backend:

```bash
cd apps/backend
npm run start:dev
```

You should see:

```
🚀 API running at http://localhost:3001
📚 Swagger docs at http://localhost:3001/api/docs
```

Open `http://localhost:3001/api/docs` in your browser — you should see the Swagger UI.

> [!NOTE]
> If you see database connection errors, double-check your `DATABASE_URL` in `apps/backend/.env`.

---

## ✅ Checklist

- [ ] `database.config.ts` updated with SSL support
- [ ] `supabase.config.ts` updated
- [ ] `app.config.ts` updated
- [ ] `jwt.config.ts` updated
- [ ] `app.module.ts` uses `ConfigService` for TypeORM
- [ ] `main.ts` uses `ConfigService` and logs startup info
- [ ] Backend starts without errors (`npm run start:dev`)
- [ ] Swagger docs accessible at `/api/docs`

---

## What's Next?

→ [**B-04:** Build the Auth Module — Register, Login, JWT, Guards](./04-auth-module.md)
