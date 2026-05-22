/**
 * TimesheetEntity
 * TODO: Define columns, relations, and constraints.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TaskerEntity } from '../../taskers/entities/tasker.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { TimesheetEntryEntity } from './timesheet-entry.entity';

@Entity('timesheets')
export class TimesheetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tasker_id' })
  taskerId: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'week_starting', type: 'date' })
  weekStarting: Date;

  @Column({ default: 'draft' })
  status: string; // draft, submitted, approved, rejected

  @Column({
    name: 'total_hours',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  totalHours: number;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TaskerEntity, (tasker) => tasker.timesheets)
  @JoinColumn({ name: 'tasker_id' })
  tasker: TaskerEntity;

  @ManyToOne(() => ProjectEntity, (project) => project.timesheets)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: UserEntity;

  @OneToMany(() => TimesheetEntryEntity, (entry) => entry.timesheet, {
    cascade: true,
  })
  entries: TimesheetEntryEntity[];
}