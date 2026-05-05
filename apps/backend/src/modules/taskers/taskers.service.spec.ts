import { Test, TestingModule } from '@nestjs/testing';
import { TaskersService } from './taskers.service';

describe('TaskersService', () => {
  let service: TaskersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskersService],
    }).compile();

    service = module.get<TaskersService>(TaskersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
