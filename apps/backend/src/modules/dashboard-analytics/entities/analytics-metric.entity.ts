/**
 * AnalyticsMetricEntity
 * TODO: Define columns, relations, and constraints.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('analyticsmetrics')
export class AnalyticsMetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  placeholder: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
