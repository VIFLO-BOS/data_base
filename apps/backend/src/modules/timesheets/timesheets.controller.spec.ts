import { Test, TestingModule } from '@nestjs/testing';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetsService } from './timesheets.service';

describe('TimesheetsController', () => {
  let controller: TimesheetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimesheetsController],
      providers: [{ provide: TimesheetsService, useValue: {} }],
    }).compile();

    controller = module.get<TimesheetsController>(TimesheetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
