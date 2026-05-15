/**
 * Exports Controller
 * TODO: Implement API endpoints for exports management.
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { ExportRequestDto } from './dto/export-request.dto';
import { ExportFilterDto } from './dto/export-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Exports')
@ApiBearerAuth()
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List export jobs' })
  findAll(
    @Query() filter: ExportFilterDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.exportsService.findAll(filter, page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get export job by ID' })
  findOne(@Param('id') id: string) {
    return this.exportsService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Request a data export' })
  requestExport(@Body() dto: ExportRequestDto, @Request() req: any) {
    return this.exportsService.requestExport(dto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete an export job' })
  remove(@Param('id') id: string) {
    return this.exportsService.delete(id);
  }
}