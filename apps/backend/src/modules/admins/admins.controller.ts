/**
 * Admins Controller
 * TODO: Implement API endpoints for admins management.
 */
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminsService } from './admins.service';

@ApiTags('Admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly service: AdminsService) {}
}
