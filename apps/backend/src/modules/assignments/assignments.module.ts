import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountProjectTaskerEntity } from './entities/account-project-tasker.entity';
import { ProjectAccountEntity } from './entities/project-account.entity';
import { AssignmentsService } from './assignments.service';
import { HoursService } from './hours.service';
import { ProjectEntity } from '../projects/entities/project.entity';
import { AccountEntity } from '../accounts/entities/account.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';
import { TimesheetEntryEntity } from '../timesheets/entities/timesheet-entry.entity';
import { AssignmentsController } from './assignments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountProjectTaskerEntity,
      ProjectAccountEntity,
      ProjectEntity,
      AccountEntity,
      TaskerEntity,
      TimesheetEntity,
      TimesheetEntryEntity,
    ]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, HoursService],
  exports: [AssignmentsService, HoursService],
})
export class AssignmentsModule {}
