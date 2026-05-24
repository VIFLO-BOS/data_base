/**
 * Projects Controller
 * TODO: Implement API endpoints for projects management.
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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all projects' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.projectsService.findAll(page || 1, limit || 20, status);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a new project' })
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a project' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Delete(':id/permanent')
  @Roles('admin', 'super_admin')
  @ApiOperation({
    summary: 'Permanently delete a project and all related data',
  })
  removePermanently(@Param('id') id: string) {
    return this.projectsService.removePermanently(id);
  }

  @Post(':id/taskers/:taskerId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Assign a tasker to a project' })
  assignTasker(
    @Param('id') id: string, 
    @Param('taskerId') taskerId: string,
    @Body('accountId') accountId?: string,
  ) {
    return this.projectsService.assignTasker(id, taskerId, accountId);
  }

  @Delete(':id/taskers/:taskerId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Remove a tasker from a project' })
  removeTasker(@Param('id') id: string, @Param('taskerId') taskerId: string) {
    return this.projectsService.removeTasker(id, taskerId);
  }

  @Post(':id/accounts/:accountId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Assign an account to a project' })
  assignAccount(
    @Param('id') id: string,
    @Param('accountId') accountId: string,
  ) {
    return this.projectsService.assignAccount(id, accountId);
  }

  @Delete(':id/accounts/:accountId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Remove an account from a project' })
  removeAccount(
    @Param('id') id: string,
    @Param('accountId') accountId: string,
  ) {
    return this.projectsService.removeAccount(id, accountId);
  }
}
