# B-08: Build Accounts — CRUD, Organization Management

> **Goal:** Full CRUD for account/organization management.  
> **Time Estimate:** 45 minutes  
> **Prerequisites:** [B-07 — Taskers Module](./07-taskers-module.md)

---

## Step 1: Account Entity

**File:** `apps/backend/src/modules/accounts/entities/account.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;
}
```

---

## Step 2: DTOs

**File:** `apps/backend/src/modules/accounts/dto/create-account.dto.ts`

```typescript
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: 'MAGS Corp' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'enterprise' })
  @IsString()
  @IsOptional()
  type?: string;
}
```

**File:** `apps/backend/src/modules/accounts/dto/update-account.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
```

> **Tip:** `PartialType` makes all fields from `CreateAccountDto` optional. This is a common NestJS pattern.

---

## Step 3: `AccountsService`

**File:** `apps/backend/src/modules/accounts/accounts.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountsRepo: Repository<AccountEntity>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.accountsRepo.findAndCount({
      relations: ['owner'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const account = await this.accountsRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async create(dto: CreateAccountDto, userId: string) {
    const account = this.accountsRepo.create({ ...dto, ownerId: userId });
    return this.accountsRepo.save(account);
  }

  async update(id: string, dto: UpdateAccountDto) {
    const account = await this.findById(id);
    Object.assign(account, dto);
    return this.accountsRepo.save(account);
  }

  async delete(id: string) {
    const account = await this.findById(id);
    await this.accountsRepo.remove(account);
    return { message: 'Account deleted' };
  }
}
```

---

## Step 4: `AccountsController`

**File:** `apps/backend/src/modules/accounts/accounts.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all accounts' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.accountsService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  findOne(@Param('id') id: string) { return this.accountsService.findById(id); }

  @Post()
  @Roles('admin', 'super_admin')
  create(@Body() dto: CreateAccountDto, @Request() req: any) {
    return this.accountsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  remove(@Param('id') id: string) { return this.accountsService.delete(id); }
}
```

---

## Step 5: Update `AccountsModule`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountEntity } from './entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity])],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
```

---

## ✅ Checklist

- [ ] `AccountEntity` with owner relation
- [ ] `CreateAccountDto`, `UpdateAccountDto`
- [ ] `AccountsService` — full CRUD with pagination
- [ ] `AccountsController` — 5 endpoints
- [ ] Module updated, test via Swagger

→ [**B-09:** Build Timesheets](./09-timesheets-module.md)
