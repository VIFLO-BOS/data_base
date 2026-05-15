/**
 * TimesheetEntryEntity
 * TODO: Define columns, relations, and constraints.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TimesheetEntity } from './timesheet.entity';

@Entity('timesheet_entries')
export class TimesheetEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'timesheet_id' })
  timesheetId: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({ name: 'hours_worked', type: 'decimal', precision: 4, scale: 2 })
  hoursWorked: number;

  @Column({ name: 'task_description', nullable: true })
  taskDescription: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TimesheetEntity, (ts) => ts.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: TimesheetEntity;
}