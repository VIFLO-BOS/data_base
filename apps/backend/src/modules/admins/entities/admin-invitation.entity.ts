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

@Entity('admin_invitations')
export class AdminInvitationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  token: string;

  @Column({ default: 'admin' })
  role: string;

  @Column({ name: 'invited_by_id' })
  invitedById: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ default: false })
  accepted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by_id' })
  invitedBy: UserEntity;
}
