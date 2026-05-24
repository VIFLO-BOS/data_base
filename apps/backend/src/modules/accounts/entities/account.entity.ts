/**
 * AccountEntity
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
import { UserEntity } from '../../users/entities/user.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { ProjectAccountEntity } from '../../assignments/entities/project-account.entity';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: 'Active' })
  status: string;

  @Column({ nullable: true })
  type: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @OneToMany(() => ProjectAccountEntity, (pa) => pa.account)
  projectAccounts: ProjectAccountEntity[];

  /** Linked projects (populated in services). */
  projects?: ProjectEntity[];

  totalHours?: number;
}