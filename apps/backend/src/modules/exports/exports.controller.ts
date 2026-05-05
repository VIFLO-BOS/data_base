/**
 * Exports Controller
 * TODO: Implement API endpoints for exports management.
 */
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExportsService } from './exports.service';

@ApiTags('Exports')
@Controller('exports')
export class ExportsController {
  constructor(private readonly service: ExportsService) {}
}
