# B-13: Build Audit Logs — Action Tracking & History

> **Goal:** Record and query all significant user actions for accountability.  
> **Time Estimate:** 45 minutes  
> **Prerequisites:** [B-12 — Notifications Module](./12-notifications-module.md)

---

## What You'll Build

- `AuditLogEntity` — Stores who did what and when
- `AuditLogsService` — Create log entries, list with filters
- `AuditLogsController` — Read-only endpoints for admins
- Useful for compliance, debugging, and user activity tracking

---

## Step 1: Audit Log Entity

**File:** `apps/backend/src/modules/audit-logs/entities/audit-log.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  action: string; // e.g. 'user.login', 'project.create', 'timesheet.approve'

  @Column({ nullable: true })
  resource: string; // e.g. 'projects', 'timesheets'

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // Any extra metadata (old values, new values, etc.)

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
```

---

## Step 2: DTOs

**File:** `apps/backend/src/modules/audit-logs/dto/audit-log-filter.dto.ts`

```typescript
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogFilterDto {
  @ApiPropertyOptional({ example: 'project.create' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'projects' })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

---

## Step 3: `AuditLogsService`

**File:** `apps/backend/src/modules/audit-logs/audit-logs.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditLogsRepo: Repository<AuditLogEntity>,
  ) {}

  async findAll(filter: AuditLogFilterDto, page = 1, limit = 50) {
    const qb = this.auditLogsRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.action) qb.andWhere('log.action = :action', { action: filter.action });
    if (filter.resource) qb.andWhere('log.resource = :resource', { resource: filter.resource });
    if (filter.userId) qb.andWhere('log.userId = :userId', { userId: filter.userId });
    if (filter.startDate) qb.andWhere('log.createdAt >= :startDate', { startDate: filter.startDate });
    if (filter.endDate) qb.andWhere('log.createdAt <= :endDate', { endDate: filter.endDate });

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Call this from other services to log an action.
   * Example: this.auditLogsService.log({ userId, action: 'project.create', resource: 'projects', resourceId: project.id });
   */
  async log(entry: Partial<AuditLogEntity>) {
    const log = this.auditLogsRepo.create(entry);
    return this.auditLogsRepo.save(log);
  }
}
```

> **Tip:** Export `AuditLogsService` so other modules (Auth, Projects, Timesheets, etc.) can inject it and call `this.auditLogsService.log(...)` whenever something important happens.

---

## Step 4: `AuditLogsController`

**File:** `apps/backend/src/modules/audit-logs/audit-logs.controller.ts`

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List audit logs with filters' })
  findAll(
    @Query() filter: AuditLogFilterDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogsService.findAll(filter, page || 1, limit || 50);
  }
}
```

> **Note:** Audit logs are read-only for admins. There are no create/update/delete endpoints — logs are created programmatically from other services.

---

## Step 5: Update `AuditLogsModule`

**File:** `apps/backend/src/modules/audit-logs/audit-logs.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogEntity } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
```

---

## ✅ Checklist

- [ ] `AuditLogEntity` with user relation and JSONB details
- [ ] `AuditLogFilterDto` — filter by action, resource, user, date range
- [ ] `AuditLogsService` — `findAll` (paginated/filtered) + `log` (for other services)
- [ ] `AuditLogsController` — read-only admin endpoint
- [ ] Module updated, exported `AuditLogsService` for cross-module use

→ [**B-14:** Build Reports & Exports](./14-reports-exports-module.md)
