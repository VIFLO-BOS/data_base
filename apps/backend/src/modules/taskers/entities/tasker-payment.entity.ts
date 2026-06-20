import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskerEntity } from './tasker.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';

@Entity('tasker_payments')
export class TaskerPaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'timestamptz' })
  paymentDate: Date;

  @Column({ name: 'tasker_id' })
  taskerId: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TaskerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tasker_id' })
  tasker: TaskerEntity;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;
}
