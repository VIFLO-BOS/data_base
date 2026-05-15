/**
 * ReportEntity
 * TODO: Define columns, relations, and constraints.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // e.g. 'timesheets', 'projects', 'taskers'

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>; // Filters used to generate the report

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>; // The report data itself

  @Column({ name: 'generated_by' })
  generatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'generated_by' })
  generator: UserEntity;
}