import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';
@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthService) {}
  @Get()
  live() { return { status: 'ok' }; }
  @Get('ready')
  ready() { return this.service.ready(); }
}
