# B-04: Build the Auth Module — Register, Login, JWT, Guards

> **Goal:** Implement admin-only authentication with JWT tokens.  
> **Time Estimate:** 2-3 hours  
> **Prerequisites:** [B-03 — NestJS Foundation](./03-nestjs-foundation.md)

---

## What You'll Build

- `UserEntity` with real columns (email, password_hash, status)
- `RegisterDto` and `LoginDto` with validation
- `AuthService` with register, login, refresh, logout logic
- `JwtStrategy` (Passport) to validate tokens on every request
- `JwtAuthGuard` with `@Public()` decorator support
- `AuthController` with 6 endpoints

---

## Step 1: Install Required Packages

These should already be in `package.json`, but verify:

```bash
cd apps/backend
npm list bcrypt passport passport-jwt @nestjs/jwt @nestjs/passport
```

If any are missing: `npm install bcrypt passport passport-jwt @nestjs/jwt @nestjs/passport`

---

## Step 2: Build the User Entity

**File:** `apps/backend/src/modules/users/entities/user.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { RoleEntity } from '../../roles/entities/role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Many-to-Many: one user can have multiple roles
  @ManyToMany(() => RoleEntity, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];
}
```

> **Key Concept:** `eager: true` means when you load a user, their roles load automatically. This is essential for RBAC guards.

---

## Step 3: Build the Role Entity

**File:** `apps/backend/src/modules/roles/entities/role.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

## Step 4: Build the Session Entity

**File:** `apps/backend/src/modules/auth/entities/session.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'refresh_token_hash', nullable: true })
  refreshTokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
```

---

## Step 5: Build the Auth DTOs

**File:** `apps/backend/src/modules/auth/dto/register.dto.ts`

```typescript
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least 1 uppercase letter' })
  @Matches(/(?=.*[0-9])/, { message: 'Password must contain at least 1 number' })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName: string;
}
```

**File:** `apps/backend/src/modules/auth/dto/login.dto.ts`

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @MinLength(1)
  password: string;
}
```

**File:** `apps/backend/src/modules/auth/dto/refresh-token.dto.ts`

```typescript
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
```

---

## Step 6: Create Password Utility

**File:** `apps/backend/src/common/utils/password.util.ts`

```typescript
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

## Step 7: Create the `@Public()` Decorator

**File:** `apps/backend/src/common/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — skips JWT authentication.
 * Usage: @Public() on any controller method.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Verify the Roles decorator exists. **File:** `apps/backend/src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to specific roles.
 * Usage: @Roles('admin', 'super_admin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

---

## Step 8: Update `JwtAuthGuard`

**File:** `apps/backend/src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
    @InjectRepository(UserEntity)
    private usersRepo: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const secret = this.config.get<string>('jwt.secret');
      const payload = jwt.verify(token, secret) as any;

      // Attach full user (with roles) to the request
      const user = await this.usersRepo.findOne({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('User not found');

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: any): string | null {
    const auth = request.headers.authorization;
    if (!auth) return null;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
```

> **Key:** The `@Public()` check at the top means login/register routes won't need a token.

---

## Step 9: Build `AuthService`

**File:** `apps/backend/src/modules/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { SessionEntity } from './entities/session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, comparePassword } from '../../common/utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private rolesRepo: Repository<RoleEntity>,
    @InjectRepository(SessionEntity)
    private sessionsRepo: Repository<SessionEntity>,
    private config: ConfigService,
  ) {}

  /**
   * Register a new admin user
   */
  async register(dto: RegisterDto) {
    // 1. Check if email already exists
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    // 2. Hash password
    const passwordHash = await hashPassword(dto.password);

    // 3. Create user
    const user = this.usersRepo.create({
      email: dto.email,
      passwordHash,
    });
    await this.usersRepo.save(user);

    // 4. Assign 'admin' role
    const adminRole = await this.rolesRepo.findOne({ where: { name: 'admin' } });
    if (adminRole) {
      user.roles = [adminRole];
      await this.usersRepo.save(user);
    }

    // 5. Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    // 2. Verify password
    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    // 3. Check user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is suspended');
    }

    // 4. Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string) {
    try {
      const secret = this.config.get<string>('jwt.secret');
      const payload = jwt.verify(refreshToken, secret) as any;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  // --- Private helpers ---

  private generateTokens(user: UserEntity) {
    const secret = this.config.get<string>('jwt.secret');
    const roleNames = user.roles?.map((r) => r.name) || [];

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, roles: roleNames, type: 'access' },
      secret,
      { expiresIn: this.config.get<string>('jwt.accessExpiration') },
    );

    const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, secret, {
      expiresIn: this.config.get<string>('jwt.refreshExpiration'),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserEntity) {
    const { passwordHash, ...safe } = user;
    return {
      ...safe,
      roles: user.roles?.map((r) => r.name) || [],
    };
  }
}
```

---

## Step 10: Build `AuthController`

**File:** `apps/backend/src/modules/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new admin account' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }
}
```

---

## Step 11: Update `AuthModule`

**File:** `apps/backend/src/modules/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { SessionEntity } from './entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, SessionEntity])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

Also update `UsersModule` to export the entity:

**File:** `apps/backend/src/modules/users/users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
```

---

## Step 12: Test It

1. Start the backend: `npm run start:dev`
2. Open Swagger: `http://localhost:3001/api/docs`
3. **Register:** Try `POST /api/v1/auth/register` with body:
   ```json
   {
     "email": "admin@test.com",
     "password": "StrongP@ss1",
     "firstName": "Admin",
     "lastName": "User"
   }
   ```
4. **Login:** Try `POST /api/v1/auth/login` with the same email/password
5. **Me:** Copy the `accessToken`, click "Authorize" in Swagger, paste it, then try `GET /api/v1/auth/me`

---

## ✅ Checklist

- [ ] `UserEntity` has real columns + roles relation
- [ ] `RoleEntity` created
- [ ] `SessionEntity` updated
- [ ] `RegisterDto`, `LoginDto`, `RefreshTokenDto` with validation
- [ ] Password utility (hash + compare)
- [ ] `@Public()` decorator created
- [ ] `JwtAuthGuard` checks for `@Public()` and validates tokens
- [ ] `AuthService` — register, login, refresh, getMe
- [ ] `AuthController` — 4 endpoints
- [ ] `AuthModule` imports all entities
- [ ] Registration works via Swagger
- [ ] Login returns JWT tokens
- [ ] `GET /me` returns user when token provided

---

## What's Next?

→ [**B-05:** Build Users & Profiles — Entities, CRUD, DTOs](./05-users-profiles-module.md)
