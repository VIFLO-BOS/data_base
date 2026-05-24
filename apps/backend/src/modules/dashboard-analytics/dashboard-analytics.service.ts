/**
 * DashboardAnalytics Service
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../projects/entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { AccountEntity } from '../accounts/entities/account.entity';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { HoursService } from '../assignments/hours.service';

@Injectable()
export class DashboardAnalyticsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectsRepo: Repository<ProjectEntity>,
    @InjectRepository(TaskerEntity)
    private taskersRepo: Repository<TaskerEntity>,
    @InjectRepository(AccountEntity)
    private accountsRepo: Repository<AccountEntity>,
    private hoursService: HoursService,
  ) {}

  async getDashboardSummary(filter: AnalyticsFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);

    const totalProjects = await this.projectsRepo.count();
    const activeTaskers = await this.taskersRepo.count({ where: { status: 'Active' } });
    const activeAccounts = await this.accountsRepo.count({ where: { status: 'Active' } });

    // Fetch period-filtered hours for trend comparison
    const periodHours = await this.hoursService.sumEntryHours({
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });

    // Always show ALL-TIME total hours on the main card
    const totalHoursAllTime = await this.hoursService.sumEntryHours({});

    let projectsTrend = 0;
    let accountsTrend = 0;
    let taskersTrend = 0;
    let hoursTrend = 0;

    if (startDate && endDate) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const prevEndDate = new Date(startDate);
      prevEndDate.setMilliseconds(-1);
      const prevStartDate = new Date(prevEndDate.getTime() - diffTime);

      // Hours trend: compare this period vs previous period
      const prevHours = await this.hoursService.sumEntryHours({
        startDate: prevStartDate,
        endDate: prevEndDate,
      });

      if (prevHours > 0) {
        hoursTrend = ((periodHours - prevHours) / prevHours) * 100;
      } else if (periodHours > 0) {
        hoursTrend = 100;
      }

      // Projects trend: new projects this period vs prior count
      const newProjects = await this.projectsRepo
        .createQueryBuilder('p')
        .where('p.created_at >= :startDate AND p.created_at <= :endDate', { startDate, endDate })
        .getCount();
      const prevProjects = totalProjects - newProjects;
      if (prevProjects > 0) {
        projectsTrend = (newProjects / prevProjects) * 100;
      } else if (newProjects > 0) {
        projectsTrend = 100;
      }

      // Accounts trend
      const newAccounts = await this.accountsRepo
        .createQueryBuilder('a')
        .where('a.created_at >= :startDate AND a.created_at <= :endDate AND a.status = :status', {
          startDate,
          endDate,
          status: 'Active',
        })
        .getCount();
      const prevAccounts = activeAccounts - newAccounts;
      if (prevAccounts > 0) {
        accountsTrend = (newAccounts / prevAccounts) * 100;
      } else if (newAccounts > 0) {
        accountsTrend = 100;
      }

      // Taskers trend
      const newTaskers = await this.taskersRepo
        .createQueryBuilder('t')
        .where('t.created_at >= :startDate AND t.created_at <= :endDate AND t.status = :status', {
          startDate,
          endDate,
          status: 'Active',
        })
        .getCount();
      const prevTaskers = activeTaskers - newTaskers;
      if (prevTaskers > 0) {
        taskersTrend = (newTaskers / prevTaskers) * 100;
      } else if (newTaskers > 0) {
        taskersTrend = 100;
      }
    }

    const chartData = this.generateMockChartData(
      filter.period || 'day',
      totalProjects,
      activeAccounts,
      activeTaskers,
      totalHoursAllTime,
    );

    return {
      totalProjects,
      projectsTrend,
      activeAccounts,
      accountsTrend,
      activeTaskers,
      taskersTrend,
      totalHoursToday: totalHoursAllTime,
      hoursTrend,
      chartData,
    };
  }

  private generateMockChartData(
    period: string,
    totalProjects: number,
    totalAccounts: number,
    totalTaskers: number,
    totalHours: number,
  ) {
    let length = 7;
    let labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    switch (period?.toLowerCase()) {
      case 'day':
        length = 7;
        labels = ['12am', '4am', '8am', '12pm', '4pm', '8pm', '11pm'];
        break;
      case 'week':
        length = 7;
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case 'month':
        length = 4;
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        break;
      case 'year':
      case 'all':
        length = 12;
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        break;
    }

    const generateCurve = (total: number) => {
      if (total === 0) return Array(length).fill(0);
      return Array.from({ length }, (_, i) => {
        const base = total / length;
        const pseudoRand = Math.abs(Math.sin(i * 1234.56)) * 0.8 + 0.2;
        return Math.max(1, Math.floor(base * pseudoRand * 1.5));
      });
    };

    return {
      labels,
      projects: generateCurve(totalProjects),
      accounts: generateCurve(totalAccounts),
      taskers: generateCurve(totalTaskers),
      hours: generateCurve(totalHours),
    };
  }

  private getDateRange(filter: AnalyticsFilterDto) {
    const baseDate = filter.date ? new Date(filter.date) : new Date();

    let startDate: Date;
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
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  }
}
