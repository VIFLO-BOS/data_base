/**
 * Timesheets Controller
 * TODO: Implement API endpoints for timesheets management.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Timesheets')
@ApiBearerAuth()
@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all timesheets' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.timesheetsService.findAll(page || 1, limit || 20, status);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  findOne(@Param('id') id: string) {
    return this.timesheetsService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a timesheet' })
  create(@Body() dto: CreateTimesheetDto) {
    return this.timesheetsService.create(dto);
  }

  @Patch(':id/submit')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Submit a draft timesheet' })
  submit(@Param('id') id: string) {
    return this.timesheetsService.submit(id);
  }

  @Patch(':id/approve')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Approve a submitted timesheet' })
  approve(@Param('id') id: string, @Request() req: any) {
    return this.timesheetsService.approve(id, req.user.id);
  }

  @Patch(':id/reject')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Reject a submitted timesheet' })
  reject(@Param('id') id: string, @Request() req: any) {
    return this.timesheetsService.reject(id, req.user.id);
  }
}