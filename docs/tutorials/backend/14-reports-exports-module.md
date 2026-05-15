# B-14: Build Reports & Exports — Generate & Download Data

> **Goal:** Allow admins to generate reports and export data as CSV/JSON.  
> **Time Estimate:** 1 hour  
> **Prerequisites:** [B-13 — Audit Logs Module](./13-audit-logs-module.md)

---

## What You'll Build

- `ReportEntity` — Stores generated report metadata
- `ExportJobEntity` — Tracks export jobs (queued, processing, done)
- Services for generating reports and managing export jobs
- Controllers with download endpoints

---

## Step 1: Report Entity

**File:** `apps/backend/src/modules/reports/entities/report.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // e.g. 'timesheets', 'projects', 'taskers'

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>; // Filters used to generate the report

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>; // The report data itself

  @Column({ name: 'generated_by' })
  generatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'generated_by' })
  generator: UserEntity;
}
```

---

## Step 2: Export Job Entity

**File:** `apps/backend/src/modules/exports/entities/export-job.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('export_jobs')
export class ExportJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'csv', 'json'

  @Column()
  resource: string; // 'timesheets', 'projects', 'taskers', 'users'

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>;

  @Column({ default: 'queued' })
  status: string; // queued, processing, completed, failed

  @Column({ name: 'file_url', nullable: true })
  fileUrl: string; // URL or path to the generated file

  @Column({ name: 'requested_by' })
  requestedBy: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'requested_by' })
  requester: UserEntity;
}
```

---

## Step 3: Report DTOs

**File:** `apps/backend/src/modules/reports/dto/generate-report.dto.ts`

```typescript
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({ example: 'Monthly Timesheet Summary' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['timesheets', 'projects', 'taskers', 'users'] })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Optional JSON filters' })
  @IsOptional()
  filters?: Record<string, any>;
}
```

**File:** `apps/backend/src/modules/reports/dto/report-filter.dto.ts`

```typescript
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportFilterDto {
  @ApiPropertyOptional({ enum: ['timesheets', 'projects', 'taskers', 'users'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

---

## Step 4: Export DTOs

**File:** `apps/backend/src/modules/exports/dto/export-request.dto.ts`

```typescript
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExportRequestDto {
  @ApiProperty({ enum: ['csv', 'json'] })
  @IsString()
  @IsIn(['csv', 'json'])
  type: string;

  @ApiProperty({ enum: ['timesheets', 'projects', 'taskers', 'users'] })
  @IsString()
  resource: string;

  @ApiPropertyOptional({ description: 'Optional JSON filters' })
  @IsOptional()
  filters?: Record<string, any>;
}
```

**File:** `apps/backend/src/modules/exports/dto/export-filter.dto.ts`

```typescript
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportFilterDto {
  @ApiPropertyOptional({ enum: ['queued', 'processing', 'completed', 'failed'] })
  @IsOptional()
  @IsString()
  @IsIn(['queued', 'processing', 'completed', 'failed'])
  status?: string;

  @ApiPropertyOptional({ enum: ['csv', 'json'] })
  @IsOptional()
  @IsString()
  type?: string;
}
```

---

## Step 5: `ReportsService`

**File:** `apps/backend/src/modules/reports/reports.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from './entities/report.entity';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private reportsRepo: Repository<ReportEntity>,
  ) {}

  async findAll(filter: ReportFilterDto, page = 1, limit = 20) {
    const qb = this.reportsRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.generator', 'generator')
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.type) qb.andWhere('report.type = :type', { type: filter.type });
    if (filter.startDate) qb.andWhere('report.createdAt >= :startDate', { startDate: filter.startDate });
    if (filter.endDate) qb.andWhere('report.createdAt <= :endDate', { endDate: filter.endDate });

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const report = await this.reportsRepo.findOne({ where: { id }, relations: ['generator'] });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async generate(dto: GenerateReportDto, userId: string) {
    // TODO: Add actual data aggregation logic based on dto.type
    const reportData = { generatedAt: new Date().toISOString(), type: dto.type, filters: dto.filters };

    const report = this.reportsRepo.create({
      name: dto.name,
      type: dto.type,
      filters: dto.filters,
      data: reportData,
      generatedBy: userId,
    });
    return this.reportsRepo.save(report);
  }

  async delete(id: string) {
    const report = await this.findById(id);
    await this.reportsRepo.remove(report);
    return { message: 'Report deleted' };
  }
}
```

---

## Step 6: `ExportsService`

**File:** `apps/backend/src/modules/exports/exports.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportJobEntity } from './entities/export-job.entity';
import { ExportRequestDto } from './dto/export-request.dto';
import { ExportFilterDto } from './dto/export-filter.dto';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(ExportJobEntity)
    private exportsRepo: Repository<ExportJobEntity>,
  ) {}

  async findAll(filter: ExportFilterDto, page = 1, limit = 20) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;

    const [data, total] = await this.exportsRepo.findAndCount({
      where,
      relations: ['requester'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const job = await this.exportsRepo.findOne({ where: { id }, relations: ['requester'] });
    if (!job) throw new NotFoundException('Export job not found');
    return job;
  }

  async requestExport(dto: ExportRequestDto, userId: string) {
    const job = this.exportsRepo.create({
      type: dto.type,
      resource: dto.resource,
      filters: dto.filters,
      requestedBy: userId,
      status: 'queued',
    });
    const saved = await this.exportsRepo.save(job);

    // TODO: In a real app, dispatch a background job here (e.g., Bull queue)
    // For now, simulate immediate completion:
    saved.status = 'completed';
    saved.completedAt = new Date();
    saved.fileUrl = `/exports/${saved.id}.${dto.type}`;
    return this.exportsRepo.save(saved);
  }

  async delete(id: string) {
    const job = await this.findById(id);
    await this.exportsRepo.remove(job);
    return { message: 'Export job deleted' };
  }
}
```

---

## Step 7: `ReportsController`

**File:** `apps/backend/src/modules/reports/reports.controller.ts`

```typescript
import { Controller, Get, Post, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all reports' })
  findAll(
    @Query() filter: ReportFilterDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reportsService.findAll(filter, page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get report by ID' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Generate a new report' })
  generate(@Body() dto: GenerateReportDto, @Request() req: any) {
    return this.reportsService.generate(dto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a report' })
  remove(@Param('id') id: string) {
    return this.reportsService.delete(id);
  }
}
```

---

## Step 8: `ExportsController`

**File:** `apps/backend/src/modules/exports/exports.controller.ts`

```typescript
import { Controller, Get, Post, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { ExportRequestDto } from './dto/export-request.dto';
import { ExportFilterDto } from './dto/export-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Exports')
@ApiBearerAuth()
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List export jobs' })
  findAll(
    @Query() filter: ExportFilterDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.exportsService.findAll(filter, page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get export job by ID' })
  findOne(@Param('id') id: string) {
    return this.exportsService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Request a data export' })
  requestExport(@Body() dto: ExportRequestDto, @Request() req: any) {
    return this.exportsService.requestExport(dto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete an export job' })
  remove(@Param('id') id: string) {
    return this.exportsService.delete(id);
  }
}
```

---

## Step 9: Update Modules

**File:** `apps/backend/src/modules/reports/reports.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportEntity } from './entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
```

**File:** `apps/backend/src/modules/exports/exports.module.ts`

```typescript

```

---

## ✅ Checklist

- [ ] `ReportEntity` with generator relation and JSONB data
- [ ] `ExportJobEntity` with status tracking and requester relation
- [ ] `GenerateReportDto`, `ReportFilterDto`
- [ ] `ExportRequestDto`, `ExportFilterDto`
- [ ] `ReportsService` — generate, list, delete
- [ ] `ExportsService` — request export, list, delete
- [ ] Both controllers with admin-only endpoints
- [ ] Both modules updated, test via Swagger

→ [**B-15:** Build Admins & Clients](./15-admins-clients-module.md)
