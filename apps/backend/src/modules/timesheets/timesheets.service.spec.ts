import { Test, TestingModule } from '@nestjs/testing';
import { TimesheetsService } from './timesheets.service';

describe('TimesheetsService', () => {
  let service: TimesheetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimesheetsService],
    }).compile();

    service = module.get<TimesheetsService>(TimesheetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
