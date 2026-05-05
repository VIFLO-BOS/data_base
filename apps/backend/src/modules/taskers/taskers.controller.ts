/**
 * Taskers Controller
 * TODO: Implement API endpoints for taskers management.
 */
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TaskersService } from './taskers.service';

@ApiTags('Taskers')
@Controller('taskers')
export class TaskersController {
  constructor(private readonly service: TaskersService) {}
}
