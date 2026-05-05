/**
 * TimesheetEntryEntity
 * TODO: Define columns, relations, and constraints.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('timesheetentrys')
export class TimesheetEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  placeholder: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
