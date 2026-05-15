# B-05: Build Users & Profiles — Entities, CRUD, DTOs

> **Goal:** Implement full CRUD for users and profiles with admin-only access.  
> **Time Estimate:** 1.5 hours  
> **Prerequisites:** [B-04 — Auth Module](./04-auth-module.md)

---

## What You'll Build

- `ProfileEntity` with user relation
- `UsersService` — findAll, findById, create, update, delete
- `ProfilesService` — findByUserId, update
- DTOs with validation for both
- Paginated list endpoint with search

---

## Step 1: Build Profile Entity

**File:** `apps/backend/src/modules/profiles/entities/profile.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
```

---

## Step 2: Add Profile Relation to UserEntity

Update `apps/backend/src/modules/users/entities/user.entity.ts` — add this inside the class:

```typescript
// Add this import at the top
import { ProfileEntity } from '../../profiles/entities/profile.entity';

// Add this property inside the class (after the roles property)
@OneToOne(() => ProfileEntity, (profile) => profile.user, { eager: true })
profile: ProfileEntity;
```

> **Note:** `eager: true` means the profile loads automatically when you query a user.

---

## Step 3: Build User DTOs

**File:** `apps/backend/src/modules/users/dto/create-user.dto.ts`

```typescript
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'admin' })
  @IsString()
  @IsOptional()
  role?: string;
}
```

**File:** `apps/backend/src/modules/users/dto/update-user.dto.ts`

```typescript
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'active', enum: ['active', 'inactive', 'suspended'] })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;
}
```

---

## Step 4: Build Profile DTO

**File:** `apps/backend/src/modules/profiles/dto/update-profile.dto.ts`

```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Africa/Lagos' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
```

---

## Step 5: Build `UsersService`

**File:** `apps/backend/src/modules/users/users.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../../common/utils/password.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepo: Repository<UserEntity>,
  ) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const where = search ? { email: Like(`%${search}%`) } : {};
    const [users, total] = await this.usersRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users.map((u) => this.sanitize(u)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    await this.usersRepo.save(user);
    return this.sanitize(user);
  }

  async delete(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.remove(user);
    return { message: 'User deleted successfully' };
  }

  private sanitize(user: UserEntity) {
    const { passwordHash, ...safe } = user;
    return { ...safe, roles: user.roles?.map((r) => r.name) || [] };
  }
}
```

---

## Step 6: Build `UsersController`

**File:** `apps/backend/src/modules/users/users.controller.ts`

```typescript
import { Controller, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page || 1, limit || 20, search);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update user status' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete user (super_admin only)' })
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
```

---

## Step 7: Update Modules

Update `UsersModule` and `ProfilesModule` to import the new entities:

**`apps/backend/src/modules/profiles/profiles.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfileEntity } from './entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileEntity])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
```

---

## Step 8: Test

1. Start backend: `npm run start:dev`
2. Register a user via `POST /api/v1/auth/register`
3. Login, get the `accessToken`
4. Use "Authorize" in Swagger and try:
   - `GET /api/v1/users` — should return the user list
   - `GET /api/v1/users/:id` — should return one user
   - `PATCH /api/v1/users/:id` — try changing status to `inactive`

---

## ✅ Checklist

- [ ] `ProfileEntity` created with user relation
- [ ] `UserEntity` updated with profile relation
- [ ] `CreateUserDto` and `UpdateUserDto` with validation
- [ ] `UpdateProfileDto` with validation
- [ ] `UsersService` — findAll (paginated), findById, update, delete
- [ ] `UsersController` — CRUD endpoints with `@Roles('admin')`
- [ ] `ProfilesModule` updated
- [ ] All endpoints testable via Swagger

---

## What's Next?

→ [**B-06:** Build Projects — CRUD, Tasker Assignment, Filtering](./06-projects-module.md)
