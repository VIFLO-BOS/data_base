import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectEntity } from './entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { AccountEntity } from '../accounts/entities/account.entity';
import { AssignmentsModule } from '../assignments/assignments.module';
import { ProjectAccountEntity } from '../assignments/entities/project-account.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';
import { AccountProjectTaskerEntity } from '../assignments/entities/account-project-tasker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectEntity,
      TaskerEntity,
      AccountEntity,
      ProjectAccountEntity,
      TimesheetEntity,
      AccountProjectTaskerEntity,
    ]),
    AssignmentsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
