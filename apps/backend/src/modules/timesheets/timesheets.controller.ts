/**
 * Timesheets Controller
 * TODO: Implement API endpoints for timesheets management.
 */
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TimesheetsService } from './timesheets.service';

@ApiTags('Timesheets')
@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly service: TimesheetsService) {}
}
