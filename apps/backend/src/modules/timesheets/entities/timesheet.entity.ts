/**
 * TimesheetEntity
 * TODO: Define columns, relations, and constraints.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('timesheets')
export class TimesheetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  placeholder: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
