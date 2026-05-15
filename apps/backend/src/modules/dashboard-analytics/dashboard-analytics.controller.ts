/**
 * DashboardAnalytics Controller
 * TODO: Implement API endpoints for dashboard-analytics management.
 */

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