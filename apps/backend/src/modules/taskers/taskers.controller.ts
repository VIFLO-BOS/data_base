/**
 * Taskers Controller
 * TODO: Implement API endpoints for taskers management.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { TaskersService } from './taskers.service';
import { CreateTaskerDto } from './dto/create-tasker.dto';
import { UpdateTaskerDto } from './dto/update-tasker.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Taskers')
@ApiBearerAuth()
@Controller('taskers')
export class TaskersController {
  constructor(private readonly taskersService: TaskersService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all taskers' })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.taskersService.findAll(page || 1, limit || 20, status);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get tasker by ID' })
  findOne(@Param('id') id: string) {
    return this.taskersService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create tasker profile' })
  create(@Body() dto: CreateTaskerDto) {
    return this.taskersService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update tasker' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskerDto) {
    return this.taskersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete tasker' })
  remove(@Param('id') id: string) {
    return this.taskersService.delete(id);
  }
}