import { Test, TestingModule } from '@nestjs/testing';
import { TaskersController } from './taskers.controller';
import { TaskersService } from './taskers.service';

describe('TaskersController', () => {
  let controller: TaskersController;
  let service: TaskersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskersController],
      providers: [
        {
          provide: TaskersService,
          useValue: {
            delete: jest.fn().mockResolvedValue({ message: 'Deleted' }),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskersController>(TaskersController);
    service = module.get<TaskersService>(TaskersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call delete on the service for removePermanently', async () => {
    const result = await controller.removePermanently('test-id');
    expect(service.delete).toHaveBeenCalledWith('test-id');
    expect(result).toEqual({ message: 'Deleted' });
  });
});
