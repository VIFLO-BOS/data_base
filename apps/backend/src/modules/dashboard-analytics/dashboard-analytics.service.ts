/**
 * DashboardAnalytics Service
 * TODO: Implement business logic for dashboard-analytics.
 */

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
    @InjectRepository(ProjectEntity)
    private projectsRepo: Repository<ProjectEntity>,
    @InjectRepository(TaskerEntity)
    private taskersRepo: Repository<TaskerEntity>,
    @InjectRepository(TimesheetEntity)
    private timesheetsRepo: Repository<TimesheetEntity>,
    @InjectRepository(AccountEntity)
    private accountsRepo: Repository<AccountEntity>,
  ) {}

  async getDashboardSummary(filter: AnalyticsFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);

    // Common WHERE clause for date filtering
    const dateCondition =
      startDate && endDate
        ? { createdAt: Between(startDate, endDate) }
        : startDate
          ? { createdAt: MoreThanOrEqual(startDate) }
          : {};

    // 1. Total Active Projects
    const activeProjects = await this.projectsRepo.count({
      where: { ...dateCondition, status: 'active' },
    });

    // 2. Total Taskers
    const totalTaskers = await this.taskersRepo.count({
      where: dateCondition,
    });

    // 3. Pending Timesheets
    const pendingTimesheets = await this.timesheetsRepo.count({
      where: { ...dateCondition, status: 'submitted' }, // 'submitted' means waiting for approval
    });

    // 4. Total Accounts
    const totalAccounts = await this.accountsRepo.count({
      where: dateCondition,
    });

    return {
      summary: {
        activeProjects,
        totalTaskers,
        pendingTimesheets,
        totalAccounts,
      },
      // You can add more complex aggregations here later (e.g., charts data)
    };
  }

  private getDateRange(filter: AnalyticsFilterDto) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (filter.startDate && filter.endDate) {
      return {
        startDate: new Date(filter.startDate),
        endDate: new Date(filter.endDate),
      };
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