/**
 * DashboardAnalytics Controller
 * Provides aggregated summary metrics for the admin dashboard.
 */

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Dashboard Analytics')
@ApiBearerAuth()
@Controller('dashboard-analytics')
export class DashboardAnalyticsController {
  constructor(private readonly analyticsService: DashboardAnalyticsService) {}

  @Get('summary')
  @Public()
  @ApiOperation({ summary: 'Get aggregated dashboard summary metrics' })
  getSummary(@Query() filter: AnalyticsFilterDto) {
    return this.analyticsService.getDashboardSummary(filter);
  }
}