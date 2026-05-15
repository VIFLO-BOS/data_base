# B-11: Build Analytics — Aggregated Stats, Chart Data, Date Filters

> **Goal:** Create a service to aggregate data for the admin dashboard.  
> **Time Estimate:** 1 hour  
> **Prerequisites:** [B-10 — Roles & Permissions](./10-roles-permissions-module.md)

---

## What You'll Build

- `DashboardAnalyticsService` — Aggregates data from multiple tables (Projects, Taskers, Timesheets, Accounts)
- `DashboardAnalyticsController` — Single endpoint to serve the dashboard UI
- Dynamic filtering by date range (Day, Week, Month, Year, Custom)

---

## Step 1: DTO for Date Filters

**File:** `apps/backend/src/modules/dashboard-analytics/dto/analytics-filter.dto.ts`

```typescript
import { IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsFilterDto {
  @ApiPropertyOptional({ enum: ['day', 'week', 'month', 'year', 'custom'] })
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year', 'custom'])
  range?: string;

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

## Step 2: `DashboardAnalyticsService`

This service needs to inject repositories from multiple modules to gather statistics.

**File:** `apps/backend/src/modules/dashboard-analytics/dashboard-analytics.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { ProjectEntity } from '../projects/entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';
import { AccountEntity } from '../accounts/entities/account.entity';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';

@Injectable()
export class DashboardAnalyticsService {
  constructor(
    @InjectRepository(ProjectEntity) private projectsRepo: Repository<ProjectEntity>,
    @InjectRepository(TaskerEntity) private taskersRepo: Repository<TaskerEntity>,
    @InjectRepository(TimesheetEntity) private timesheetsRepo: Repository<TimesheetEntity>,
    @InjectRepository(AccountEntity) private accountsRepo: Repository<AccountEntity>,
  ) {}

  async getDashboardSummary(filter: AnalyticsFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);

    // Common WHERE clause for date filtering
    const dateCondition = startDate && endDate 
      ? { createdAt: Between(startDate, endDate) } 
      : startDate 
        ? { createdAt: MoreThanOrEqual(startDate) } 
        : {};

    // 1. Total Active Projects
    const activeProjects = await this.projectsRepo.count({
      where: { ...dateCondition, status: 'active' }
    });

    // 2. Total Taskers
    const totalTaskers = await this.taskersRepo.count({
      where: dateCondition
    });

    // 3. Pending Timesheets
    const pendingTimesheets = await this.timesheetsRepo.count({
      where: { ...dateCondition, status: 'submitted' } // 'submitted' means waiting for approval
    });

    // 4. Total Accounts
    const totalAccounts = await this.accountsRepo.count({
      where: dateCondition
    });

    return {
      summary: {
        activeProjects,
        totalTaskers,
        pendingTimesheets,
        totalAccounts
      },
      // You can add more complex aggregations here later (e.g., charts data)
    };
  }

  private getDateRange(filter: AnalyticsFilterDto) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (filter.startDate && filter.endDate) {
       return { startDate: new Date(filter.startDate), endDate: new Date(filter.endDate) };
    }

    switch (filter.range) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        // No filter
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  }
}
```

---

## Step 3: `DashboardAnalyticsController`

**File:** `apps/backend/src/modules/dashboard-analytics/dashboard-analytics.controller.ts`

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Dashboard Analytics')
@ApiBearerAuth()
@Controller('dashboard-analytics')
export class DashboardAnalyticsController {
  constructor(private readonly analyticsService: DashboardAnalyticsService) {}

  @Get('summary')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get aggregated dashboard summary metrics' })
  getSummary(@Query() filter: AnalyticsFilterDto) {
    return this.analyticsService.getDashboardSummary(filter);
  }
}
```

---

## Step 4: Update `DashboardAnalyticsModule`

Because this module uses repositories from other modules, we need to import those modules' entities (or the modules themselves if they export `TypeOrmModule`). It's generally cleaner to import the entities directly if you just need database access.

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { ProjectEntity } from '../projects/entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';
import { AccountEntity } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectEntity, 
      TaskerEntity, 
      TimesheetEntity, 
      AccountEntity
    ])
  ],
  controllers: [DashboardAnalyticsController],
  providers: [DashboardAnalyticsService],
})
export class DashboardAnalyticsModule {}
```

---

## ✅ Checklist

- [ ] `AnalyticsFilterDto` created for date range filtering
- [ ] `DashboardAnalyticsService` implements `getDashboardSummary` aggregating from multiple tables
- [ ] `DashboardAnalyticsController` exposes the `/summary` endpoint
- [ ] Module imports necessary entities

→ [**B-12:** Build Notifications Module](./12-notifications-module.md)
