/**
 * Admins Controller
 * TODO: Implement API endpoints for admins management.
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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admins')
@ApiBearerAuth()
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'List all admins' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminsService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get admin by ID' })
  findOne(@Param('id') id: string) {
    return this.adminsService.findById(id);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create admin profile' })
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update admin' })
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete admin' })
  remove(@Param('id') id: string) {
    return this.adminsService.delete(id);
  }
}