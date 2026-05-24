import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TaskersController } from './taskers.controller';
import { TaskersService } from './taskers.service';
import { TaskerEntity } from './entities/tasker.entity';
import { TaskerPaymentEntity } from './entities/tasker-payment.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';
import { TimesheetEntryEntity } from '../timesheets/entities/timesheet-entry.entity';
import { AssignmentsModule } from '../assignments/assignments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskerEntity,
      TaskerPaymentEntity,
      TimesheetEntity,
      TimesheetEntryEntity,
    ]),
    AssignmentsModule,
  ],
  controllers: [TaskersController],
  providers: [TaskersService],
  exports: [TaskersService],
})
export class TaskersModule {}
