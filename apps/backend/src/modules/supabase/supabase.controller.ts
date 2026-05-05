/**
 * Supabase Controller
 * TODO: Implement API endpoints for supabase management.
 */
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupabaseService } from './supabase.service';

@ApiTags('Supabase')
@Controller('supabase')
export class SupabaseController {
  constructor(private readonly service: SupabaseService) {}
}
