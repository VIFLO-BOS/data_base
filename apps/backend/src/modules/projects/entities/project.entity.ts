/**
 * ProjectEntity
 * TODO: Define columns, relations, and constraints.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { AccountEntity } from '../../accounts/entities/account.entity';
import { TaskerEntity } from '../../taskers/entities/tasker.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'platform_name', nullable: true })
  platformName: string;

  @Column({ name: 'platform_url', nullable: true })
  platformUrl: string;

  @Column({ name: 'price_per_hour', type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerHour: number;

  @Column({ default: 'draft' })
  status: string; // draft, active, paused, completed, archived

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @ManyToMany(() => AccountEntity, (account) => account.projects)
  @JoinTable({
    name: 'project_accounts',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'account_id', referencedColumnName: 'id' },
  })
  accounts: AccountEntity[];

  @ManyToMany(() => TaskerEntity, (tasker) => tasker.projects)
  @JoinTable({
    name: 'project_taskers',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tasker_id', referencedColumnName: 'id' },
  })
  taskers: TaskerEntity[];

  @OneToMany('TimesheetEntity', (timesheet: any) => timesheet.project)
  timesheets: any[];

  totalHours?: number;
}