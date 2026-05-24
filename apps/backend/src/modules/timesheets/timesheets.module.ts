import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetsService } from './timesheets.service';
import { TimesheetEntity } from './entities/timesheet.entity';
import { TimesheetEntryEntity } from './entities/timesheet-entry.entity';
import { AssignmentsModule } from '../assignments/assignments.module';
import { TaskerPaymentEntity } from '../taskers/entities/tasker-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimesheetEntity, 
      TimesheetEntryEntity,
      TaskerPaymentEntity,
    ]),
    AssignmentsModule,
  ],
  controllers: [TimesheetsController],
  providers: [TimesheetsService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}
