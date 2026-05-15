/**
 * ExportJobEntity
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
import { UserEntity } from '../../users/entities/user.entity';

@Entity('export_jobs')
export class ExportJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'csv', 'json'

  @Column()
  resource: string; // 'timesheets', 'projects', 'taskers', 'users'

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>;

  @Column({ default: 'queued' })
  status: string; // queued, processing, completed, failed

  @Column({ name: 'file_url', nullable: true })
  fileUrl: string; // URL or path to the generated file

  @Column({ name: 'requested_by' })
  requestedBy: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'requested_by' })
  requester: UserEntity;
}