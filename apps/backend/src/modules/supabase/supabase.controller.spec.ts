import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseController } from './supabase.controller';
import { SupabaseService } from './supabase.service';

describe('SupabaseController', () => {
  let controller: SupabaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupabaseController],
      providers: [{ provide: SupabaseService, useValue: {} }],
    }).compile();

    controller = module.get<SupabaseController>(SupabaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
