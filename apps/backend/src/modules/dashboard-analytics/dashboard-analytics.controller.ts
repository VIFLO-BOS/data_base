/**
 * DashboardAnalytics Controller
 * TODO: Implement API endpoints for dashboard-analytics management.
 */
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardAnalyticsService } from './dashboard-analytics.service';

@ApiTags('DashboardAnalytics')
@Controller('dashboard-analytics')
export class DashboardAnalyticsController {
  constructor(private readonly service: DashboardAnalyticsService) {}
}
