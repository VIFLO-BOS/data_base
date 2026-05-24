import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AccountEntity } from '../../accounts/entities/account.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { TaskerEntity } from '../../taskers/entities/tasker.entity';

export type AssignmentStatus =
  | 'active'
  | 'achieved'
  | 'disqualified'
  | 'removed'
  | 'inactive';

@Entity('account_project_taskers')
@Index(['accountId', 'projectId', 'taskerId'], { unique: true })
export class AccountProjectTaskerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'tasker_id' })
  taskerId: string;

  @Column({ name: 'assigned_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ name: 'removed_at', type: 'timestamptz', nullable: true })
  removedAt: Date | null;

  @Column({ default: 'active' })
  status: AssignmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @ManyToOne(() => TaskerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tasker_id' })
  tasker: TaskerEntity;
}
