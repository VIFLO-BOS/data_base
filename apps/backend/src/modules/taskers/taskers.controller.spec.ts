import { Test, TestingModule } from '@nestjs/testing';
import { TaskersController } from './taskers.controller';
import { TaskersService } from './taskers.service';

describe('TaskersController', () => {
  let controller: TaskersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskersController],
      providers: [{ provide: TaskersService, useValue: {} }],
    }).compile();

    controller = module.get<TaskersController>(TaskersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
