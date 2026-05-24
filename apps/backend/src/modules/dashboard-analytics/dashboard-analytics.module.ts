import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { ProjectEntity } from '../projects/entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { AccountEntity } from '../accounts/entities/account.entity';
import { AssignmentsModule } from '../assignments/assignments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity, TaskerEntity, AccountEntity]),
    AssignmentsModule,
  ],
  controllers: [DashboardAnalyticsController],
  providers: [DashboardAnalyticsService],
  exports: [DashboardAnalyticsService],
})
export class DashboardAnalyticsModule {}
