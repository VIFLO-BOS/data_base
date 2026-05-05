/**
 * DashboardAnalytics Module
 */
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { AnalyticsMetricEntity } from './entities/analytics-metric.entity';


@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsMetricEntity])],
  controllers: [DashboardAnalyticsController],
  providers: [DashboardAnalyticsService],
  exports: [DashboardAnalyticsService],
})
export class DashboardAnalyticsModule {}
