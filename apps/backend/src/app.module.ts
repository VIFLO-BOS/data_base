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
import { AssignmentsModule } from './modules/assignments/assignments.module';

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

    //Connect to Supabase PostgreSQL via TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: config.get<string>('app.env') !== 'production',
        ssl:
          config.get<string>('app.env') === 'production'
            ? { rejectUnauthorized: false }
            : false,

        // ── Connection resilience ──────────────────────────────────────
        // Retry connecting on startup (e.g. if DB isn't ready yet)
        retryAttempts: 10,
        retryDelay: 3000, // 3 seconds between retries

        // Keep the connection alive across idle periods
        keepConnectionAlive: true,

        // Connection pool settings (pg driver)
        extra: {
          // Maximum connections in the pool
          max: 20,
          // Return an error after 30s if no connection available
          connectionTimeoutMillis: 30000,
          // Close idle connections after 10 seconds
          idleTimeoutMillis: 10000,
          // Verify connection is alive before lending from pool
          allowExitOnIdle: false,
        },
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
    AssignmentsModule,
  ],
  providers: [
    // Global guards: JWT -> Roles -> Permissions (applied to every route)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },

    // Global interceptor: wraps all responses in the {success,data} format
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

    // Global filter: catches all exceptions and returns consistent error format
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
