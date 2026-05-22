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
  ) { }

  async getDashboardSummary(filter: AnalyticsFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);

    // 1. Total Projects
    const totalProjects = await this.projectsRepo.count();

    // 2. Total Taskers
    const totalTaskers = await this.taskersRepo.count();

    // 3. Total Hours (Sum of timesheet totalHours) — uses QueryBuilder syntax
    const hoursQb = this.timesheetsRepo
      .createQueryBuilder('timesheet')
      .select('SUM(timesheet.total_hours)', 'sum');

    if (startDate && endDate) {
      hoursQb.where('timesheet.created_at >= :startDate AND timesheet.created_at <= :endDate', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    } else if (startDate) {
      hoursQb.where('timesheet.created_at >= :startDate', {
        startDate: startDate.toISOString(),
      });
    }

    const hoursResult = await hoursQb.getRawOne();
    const totalHours = hoursResult?.sum ? parseFloat(hoursResult.sum) : 0;

    // 4. Total Accounts
    const totalAccounts = await this.accountsRepo.count();

    return {
      totalProjects,
      projectsTrend: 0,
      activeAccounts: totalAccounts,
      accountsTrend: 0,
      activeTaskers: totalTaskers,
      taskersTrend: 0,
      totalHoursToday: totalHours,
      hoursTrend: 0,
    };
  }

  private getDateRange(filter: AnalyticsFilterDto) {
    // If a specific date is provided, use it as the base date, otherwise use now.
    const baseDate = filter.date ? new Date(filter.date) : new Date();

    let startDate: Date;
    // Set endDate to the end of the selected base date
    let endDate: Date = new Date(baseDate);
    endDate.setHours(23, 59, 59, 999);

    switch (filter.period?.toLowerCase()) {
      case 'day':
        startDate = new Date(baseDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(baseDate);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(baseDate);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(baseDate);
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        // No filter or 'all time'
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  }
}