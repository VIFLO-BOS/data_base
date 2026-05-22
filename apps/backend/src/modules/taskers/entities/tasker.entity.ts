/**
 * TaskerEntity
 * TODO: Define columns, relations, and constraints.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { TaskerPaymentEntity } from './tasker-payment.entity';


@Entity('taskers')
export class TaskerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'account_name', nullable: true })
  accountName: string;

  @Column({ name: 'account_number', nullable: true })
  accountNumber: string;

  @Column('text', { array: true, nullable: true })
  skills: string[];

  @Column({ name: 'availability_status', default: 'available' })
  availabilityStatus: string;

  @Column({ default: 'Active' })
  status: string;

  @Column({
    name: 'hourly_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ nullable: true })
  bio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToMany(() => ProjectEntity, (project) => project.taskers)
  projects: ProjectEntity[];

  @OneToMany(() => TaskerPaymentEntity, (payment) => payment.tasker)
  payments: TaskerPaymentEntity[];

  @OneToMany('TimesheetEntity', (timesheet: any) => timesheet.tasker)
  timesheets: any[];

  totalHours?: number;
}