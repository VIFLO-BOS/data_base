/**
 * AuditLogs Controller
 * TODO: Implement API endpoints for audit-logs management.
 */
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('AuditLogs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}
}
