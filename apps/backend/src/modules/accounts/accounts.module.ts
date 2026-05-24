import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountEntity } from './entities/account.entity';
import { AssignmentsModule } from '../assignments/assignments.module';
import { AccountProjectTaskerEntity } from '../assignments/entities/account-project-tasker.entity';

import { ProjectAccountEntity } from '../assignments/entities/project-account.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity, 
      AccountProjectTaskerEntity, 
      ProjectAccountEntity, 
      TimesheetEntity
    ]),
    AssignmentsModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
