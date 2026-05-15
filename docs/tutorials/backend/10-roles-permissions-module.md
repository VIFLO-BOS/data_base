# B-10: Build Roles & Permissions — RBAC Management Endpoints

> **Goal:** Admin endpoints for managing roles and permissions.  
> **Time Estimate:** 45 minutes  
> **Prerequisites:** [B-09 — Timesheets Module](./09-timesheets-module.md)

---

## Step 1: Permission Entity

**File:** `apps/backend/src/modules/permissions/entities/permission.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

## Step 2: `RolesService`

**File:** `apps/backend/src/modules/roles/roles.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private rolesRepo: Repository<RoleEntity>,
  ) {}

  async findAll() {
    return this.rolesRepo.find({ order: { name: 'ASC' } });
  }

  async findByName(name: string) {
    const role = await this.rolesRepo.findOne({ where: { name } });
    if (!role) throw new NotFoundException(`Role '${name}' not found`);
    return role;
  }
}
```

---

## Step 3: `RolesController`

**File:** `apps/backend/src/modules/roles/roles.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all roles' })
  findAll() { return this.rolesService.findAll(); }
}
```

---

## Step 4: `PermissionsService` and `PermissionsController`

Follow the same pattern as Roles. **File:** `apps/backend/src/modules/permissions/permissions.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private permsRepo: Repository<PermissionEntity>,
  ) {}

  async findAll() {
    return this.permsRepo.find({ order: { resource: 'ASC', action: 'ASC' } });
  }

  async findByResourceAction(resource: string, action: string) {
    return this.permsRepo.findOne({ where: { resource, action } });
  }
}
```

**File:** `apps/backend/src/modules/permissions/permissions.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permsService: PermissionsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all permissions' })
  findAll() { return this.permsService.findAll(); }
}
```

---

## Step 5: Update Both Modules

**`RolesModule`:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService, TypeOrmModule],
})
export class RolesModule {}
```

**`PermissionsModule`:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionEntity } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService, TypeOrmModule],
})
export class PermissionsModule {}
```

---

## ✅ Checklist

- [ ] `PermissionEntity` created
- [ ] `RolesService` + controller with list endpoint
- [ ] `PermissionsService` + controller with list endpoint
- [ ] Both modules updated and export TypeORM

→ [**B-11:** Build Analytics](./11-analytics-module.md)
