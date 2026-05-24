import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AssignmentsService } from './assignments.service';
import { AssignmentStatus } from './entities/account-project-tasker.entity';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('accounts/:accountId/projects/:projectId/taskers/:taskerId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Assign tasker to project under account' })
  assignTasker(
    @Param('accountId') accountId: string,
    @Param('projectId') projectId: string,
    @Param('taskerId') taskerId: string,
  ) {
    return this.assignmentsService.assignTasker(accountId, projectId, taskerId);
  }

  @Patch('accounts/:accountId/projects/:projectId/taskers/:taskerId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update assignment status' })
  updateStatus(
    @Param('accountId') accountId: string,
    @Param('projectId') projectId: string,
    @Param('taskerId') taskerId: string,
    @Body() body: { status: AssignmentStatus },
  ) {
    return this.assignmentsService.updateAssignmentStatus(
      accountId,
      projectId,
      taskerId,
      body.status,
    );
  }

  @Post('accounts/:accountId/projects/:projectId/taskers')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Replace active taskers for account on project' })
  replaceTaskers(
    @Param('accountId') accountId: string,
    @Param('projectId') projectId: string,
    @Body() body: { taskerIds: string[] },
  ) {
    return this.assignmentsService.replaceTaskersForAccountProject(
      accountId,
      projectId,
      body.taskerIds || [],
    );
  }
}
