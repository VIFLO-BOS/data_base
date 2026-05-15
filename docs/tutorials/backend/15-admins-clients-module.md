# B-15: Build Admins & Clients — Role-Specific Profiles

> **Goal:** Create admin and client profile management linked to user accounts.  
> **Time Estimate:** 45 minutes  
> **Prerequisites:** [B-14 — Reports & Exports](./14-reports-exports-module.md)

---

## What You'll Build

- `AdminEntity` — Extended profile for admin users (permissions level, department)
- `ClientEntity` — Extended profile for client users (company, billing info)
- Full CRUD services and controllers for both
- These complement the base `UserEntity` by adding role-specific data

---

## Part A: Admins Module

### Step 1: Admin Entity

**File:** `apps/backend/src/modules/admins/entities/admin.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('admins')
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  department: string;

  @Column({ name: 'access_level', default: 'standard' })
  accessLevel: string; // standard, elevated, super

  @Column({ type: 'jsonb', default: '{}' })
  preferences: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
```

---

### Step 2: Admin DTOs

**File:** `apps/backend/src/modules/admins/dto/create-admin.dto.ts`

```typescript
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ description: 'User ID to link this admin profile to' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ enum: ['standard', 'elevated', 'super'] })
  @IsOptional()
  @IsIn(['standard', 'elevated', 'super'])
  accessLevel?: string;
}
```

**File:** `apps/backend/src/modules/admins/dto/update-admin.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {}
```

---

### Step 3: `AdminsService`

**File:** `apps/backend/src/modules/admins/admins.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminEntity)
    private adminsRepo: Repository<AdminEntity>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.adminsRepo.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const admin = await this.adminsRepo.findOne({ where: { id }, relations: ['user'] });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async create(dto: CreateAdminDto) {
    const admin = this.adminsRepo.create(dto);
    return this.adminsRepo.save(admin);
  }

  async update(id: string, dto: UpdateAdminDto) {
    const admin = await this.findById(id);
    Object.assign(admin, dto);
    return this.adminsRepo.save(admin);
  }

  async delete(id: string) {
    const admin = await this.findById(id);
    await this.adminsRepo.remove(admin);
    return { message: 'Admin deleted' };
  }
}
```

---

### Step 4: `AdminsController`

**File:** `apps/backend/src/modules/admins/admins.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admins')
@ApiBearerAuth()
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'List all admins' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminsService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get admin by ID' })
  findOne(@Param('id') id: string) {
    return this.adminsService.findById(id);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create admin profile' })
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update admin' })
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete admin' })
  remove(@Param('id') id: string) {
    return this.adminsService.delete(id);
  }
}
```

---

### Step 5: Update `AdminsModule`

**File:** `apps/backend/src/modules/admins/admins.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { AdminEntity } from './entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity])],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
```

---

## Part B: Clients Module

> **Note:** You already updated the `ClientEntity` in [B-06](./06-projects-module.md) when setting up the project relations. This step fills in the service, controller, and DTOs.

### Step 6: Client DTOs

**File:** `apps/backend/src/modules/clients/dto/create-client.dto.ts`

```typescript
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'User ID to link this client profile to' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: '123 Main St, London' })
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @ApiPropertyOptional({ example: 'bank_transfer' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
```

**File:** `apps/backend/src/modules/clients/dto/update-client.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
```

---

### Step 7: `ClientsService`

**File:** `apps/backend/src/modules/clients/clients.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientEntity)
    private clientsRepo: Repository<ClientEntity>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.clientsRepo.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const client = await this.clientsRepo.findOne({ where: { id }, relations: ['user'] });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(dto: CreateClientDto) {
    const client = this.clientsRepo.create(dto);
    return this.clientsRepo.save(client);
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.findById(id);
    Object.assign(client, dto);
    return this.clientsRepo.save(client);
  }

  async delete(id: string) {
    const client = await this.findById(id);
    await this.clientsRepo.remove(client);
    return { message: 'Client deleted' };
  }
}
```

---

### Step 8: `ClientsController`

**File:** `apps/backend/src/modules/clients/clients.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all clients' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.clientsService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get client by ID' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create client profile' })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update client' })
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete client' })
  remove(@Param('id') id: string) {
    return this.clientsService.delete(id);
  }
}
```

---

### Step 9: Update `ClientsModule`

**File:** `apps/backend/src/modules/clients/clients.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientEntity } from './entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity])],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
```

---

## ✅ Checklist

**Admins:**
- [ ] `AdminEntity` with user relation, department, access level
- [ ] `CreateAdminDto`, `UpdateAdminDto`
- [ ] `AdminsService` — full CRUD with pagination
- [ ] `AdminsController` — super_admin-only endpoints
- [ ] Module updated

**Clients:**
- [ ] `ClientEntity` already updated (from B-06)
- [ ] `CreateClientDto`, `UpdateClientDto`
- [ ] `ClientsService` — full CRUD with pagination
- [ ] `ClientsController` — admin-only endpoints
- [ ] Module updated

Test both via Swagger at `http://localhost:3001/api/docs`.

---

## 🎉 Backend Tutorials Complete!

You've now built the entire backend for the Annotator Platform:

| # | Module | What it does |
|---|--------|-------------|
| 01 | Supabase Setup | Database provisioning |
| 02 | Database Schema | Table design |
| 03 | NestJS Foundation | Project scaffolding |
| 04 | Auth | Register, login, JWT, sessions |
| 05 | Users & Profiles | User management |
| 06 | Projects | Project CRUD with tasker assignment |
| 07 | Taskers | Tasker profiles and management |
| 08 | Accounts | Organization management |
| 09 | Timesheets | Time tracking with entries |
| 10 | Roles & Permissions | RBAC system |
| 11 | Analytics | Dashboard statistics |
| 12 | Notifications | In-app notification system |
| 13 | Audit Logs | Action tracking |
| 14 | Reports & Exports | Data reporting and file exports |
| 15 | Admins & Clients | Role-specific profiles |
