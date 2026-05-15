# B-09: Build Timesheets — Submit, Approve, Reject Workflow

> **Goal:** Timesheet CRUD with approval workflow (submit → approve/reject).  
> **Time Estimate:** 1.5 hours  
> **Prerequisites:** [B-08 — Accounts Module](./08-accounts-module.md)

---

## Step 1: Timesheet Entities

**File:** `apps/backend/src/modules/timesheets/entities/timesheet.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { TaskerEntity } from '../../taskers/entities/tasker.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { TimesheetEntryEntity } from './timesheet-entry.entity';

@Entity('timesheets')
export class TimesheetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tasker_id' })
  taskerId: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'week_starting', type: 'date' })
  weekStarting: Date;

  @Column({ default: 'draft' })
  status: string; // draft, submitted, approved, rejected

  @Column({ name: 'total_hours', type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalHours: number;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TaskerEntity)
  @JoinColumn({ name: 'tasker_id' })
  tasker: TaskerEntity;

  @ManyToOne(() => ProjectEntity)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: UserEntity;

  @OneToMany(() => TimesheetEntryEntity, (entry) => entry.timesheet, { cascade: true })
  entries: TimesheetEntryEntity[];
}
```

**File:** `apps/backend/src/modules/timesheets/entities/timesheet-entry.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { TimesheetEntity } from './timesheet.entity';

@Entity('timesheet_entries')
export class TimesheetEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'timesheet_id' })
  timesheetId: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({ name: 'hours_worked', type: 'decimal', precision: 4, scale: 2 })
  hoursWorked: number;

  @Column({ name: 'task_description', nullable: true })
  taskDescription: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TimesheetEntity, (ts) => ts.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: TimesheetEntity;
}
```

---

## Step 2: DTOs

**File:** `apps/backend/src/modules/timesheets/dto/create-timesheet.dto.ts`

```typescript
import { IsString, IsDateString, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimesheetEntryDto {
  @ApiProperty({ example: '2026-05-05' })
  @IsDateString()
  entryDate: string;

  @ApiProperty({ example: 8.0 })
  @IsNumber()
  hoursWorked: number;

  @ApiPropertyOptional({ example: 'Labeled 500 images' })
  @IsString()
  @IsOptional()
  taskDescription?: string;
}

export class CreateTimesheetDto {
  @ApiProperty()
  @IsString()
  taskerId: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty({ example: '2026-05-05' })
  @IsDateString()
  weekStarting: string;

  @ApiProperty({ type: [TimesheetEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimesheetEntryDto)
  entries: TimesheetEntryDto[];
}
```

---

## Step 3: `TimesheetsService`

**File:** `apps/backend/src/modules/timesheets/timesheets.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimesheetEntity } from './entities/timesheet.entity';
import { TimesheetEntryEntity } from './entities/timesheet-entry.entity';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';

@Injectable()
export class TimesheetsService {
  constructor(
    @InjectRepository(TimesheetEntity)
    private timesheetsRepo: Repository<TimesheetEntity>,
    @InjectRepository(TimesheetEntryEntity)
    private entriesRepo: Repository<TimesheetEntryEntity>,
  ) {}

  async findAll(page = 1, limit = 20, status?: string) {
    const qb = this.timesheetsRepo.createQueryBuilder('ts')
      .leftJoinAndSelect('ts.tasker', 'tasker')
      .leftJoinAndSelect('tasker.user', 'user')
      .leftJoinAndSelect('ts.project', 'project')
      .leftJoinAndSelect('ts.entries', 'entries')
      .orderBy('ts.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.where('ts.status = :status', { status });
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const ts = await this.timesheetsRepo.findOne({
      where: { id },
      relations: ['tasker', 'tasker.user', 'project', 'entries', 'approver'],
    });
    if (!ts) throw new NotFoundException('Timesheet not found');
    return ts;
  }

  async create(dto: CreateTimesheetDto) {
    const totalHours = dto.entries.reduce((sum, e) => sum + e.hoursWorked, 0);
    const timesheet = this.timesheetsRepo.create({
      taskerId: dto.taskerId,
      projectId: dto.projectId,
      weekStarting: dto.weekStarting as any,
      totalHours,
      entries: dto.entries.map((e) => this.entriesRepo.create(e as any)),
    });
    return this.timesheetsRepo.save(timesheet);
  }

  async submit(id: string) {
    const ts = await this.findById(id);
    if (ts.status !== 'draft') throw new BadRequestException('Only draft timesheets can be submitted');
    ts.status = 'submitted';
    ts.submittedAt = new Date();
    return this.timesheetsRepo.save(ts);
  }

  async approve(id: string, approverId: string) {
    const ts = await this.findById(id);
    if (ts.status !== 'submitted') throw new BadRequestException('Only submitted timesheets can be approved');
    ts.status = 'approved';
    ts.approvedAt = new Date();
    ts.approvedBy = approverId;
    return this.timesheetsRepo.save(ts);
  }

  async reject(id: string, approverId: string) {
    const ts = await this.findById(id);
    if (ts.status !== 'submitted') throw new BadRequestException('Only submitted timesheets can be rejected');
    ts.status = 'rejected';
    ts.approvedBy = approverId;
    return this.timesheetsRepo.save(ts);
  }
}
```

---

## Step 4: `TimesheetsController`

**File:** `apps/backend/src/modules/timesheets/timesheets.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Param, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Timesheets')
@ApiBearerAuth()
@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all timesheets' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.timesheetsService.findAll(page || 1, limit || 20, status);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  findOne(@Param('id') id: string) { return this.timesheetsService.findById(id); }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a timesheet' })
  create(@Body() dto: CreateTimesheetDto) { return this.timesheetsService.create(dto); }

  @Patch(':id/submit')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Submit a draft timesheet' })
  submit(@Param('id') id: string) { return this.timesheetsService.submit(id); }

  @Patch(':id/approve')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Approve a submitted timesheet' })
  approve(@Param('id') id: string, @Request() req: any) {
    return this.timesheetsService.approve(id, req.user.id);
  }

  @Patch(':id/reject')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Reject a submitted timesheet' })
  reject(@Param('id') id: string, @Request() req: any) {
    return this.timesheetsService.reject(id, req.user.id);
  }
}
```

---

## Step 5: Update `TimesheetsModule`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetsService } from './timesheets.service';
import { TimesheetEntity } from './entities/timesheet.entity';
import { TimesheetEntryEntity } from './entities/timesheet-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimesheetEntity, TimesheetEntryEntity])],
  controllers: [TimesheetsController],
  providers: [TimesheetsService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}
```

---

## ✅ Checklist

- [ ] `TimesheetEntity` and `TimesheetEntryEntity` with relations
- [ ] `CreateTimesheetDto` with nested entries validation
- [ ] `TimesheetsService` — CRUD + submit/approve/reject workflow
- [ ] `TimesheetsController` — 6 endpoints
- [ ] Test the full workflow: create → submit → approve

→ [**B-10:** Build Roles & Permissions](./10-roles-permissions-module.md)
