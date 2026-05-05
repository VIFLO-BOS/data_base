import { Test, TestingModule } from '@nestjs/testing';
import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { DashboardAnalyticsService } from './dashboard-analytics.service';

describe('DashboardAnalyticsController', () => {
  let controller: DashboardAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardAnalyticsController],
      providers: [{ provide: DashboardAnalyticsService, useValue: {} }],
    }).compile();

    controller = module.get<DashboardAnalyticsController>(DashboardAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
