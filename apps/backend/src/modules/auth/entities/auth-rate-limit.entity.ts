import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
@Entity('auth_rate_limits')
export class AuthRateLimitEntity {
  @PrimaryColumn()
  key: string;
  @Column({ default: 0 })
  hits: number;
  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
