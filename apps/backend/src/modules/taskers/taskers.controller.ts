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

  @Delete(':id/permanent')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Permanently delete tasker' })
  removePermanently(@Param('id') id: string) {
    return this.taskersService.delete(id);
  }

  @Post(':id/payments')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Add a payment to a tasker' })
  addPayment(@Param('id') id: string, @Body() dto: any) {
    return this.taskersService.addPayment(id, dto);
  }

  @Post(':id/hours')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Add daily hours or casualties to a tasker' })
  addDailyHour(@Param('id') id: string, @Body() dto: any) {
    return this.taskersService.addDailyHour(id, dto);
  }

  @Patch(':id/payments/:paymentId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a tasker payment' })
  updatePayment(@Param('paymentId') paymentId: string, @Body() dto: any) {
    return this.taskersService.updatePayment(paymentId, dto);
  }

  @Patch(':id/hours/:hourId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update tasker daily hours' })
  updateDailyHour(@Param('hourId') hourId: string, @Body() dto: any) {
    return this.taskersService.updateDailyHour(hourId, dto);
  }
}
