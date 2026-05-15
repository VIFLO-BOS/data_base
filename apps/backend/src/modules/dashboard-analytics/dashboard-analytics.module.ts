/**
 * DashboardAnalytics Module
 */
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
      AccountEntity,
    ]),
  ],
  controllers: [DashboardAnalyticsController],
  providers: [DashboardAnalyticsService],
  exports: [DashboardAnalyticsService],
})
export class DashboardAnalyticsModule {}