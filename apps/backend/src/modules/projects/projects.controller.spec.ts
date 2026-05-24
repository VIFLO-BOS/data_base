import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            removePermanently: jest.fn().mockResolvedValue({ message: 'Deleted' }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call removePermanently on the service', async () => {
    const result = await controller.removePermanently('test-id');
    expect(service.removePermanently).toHaveBeenCalledWith('test-id');
    expect(result).toEqual({ message: 'Deleted' });
  });
});
