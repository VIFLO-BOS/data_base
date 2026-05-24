import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: {
            delete: jest.fn().mockResolvedValue({ message: 'Deleted' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);
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
