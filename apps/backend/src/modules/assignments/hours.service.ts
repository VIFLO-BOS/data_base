import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimesheetEntryEntity } from '../timesheets/entities/timesheet-entry.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';

export interface HoursFilter {
  accountId?: string;
  projectId?: string;
  taskerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface HoursBreakdownRow {
  accountId: string;
  projectId: string;
  taskerId: string;
  hours: number;
}

@Injectable()
export class HoursService {
  constructor(
    @InjectRepository(TimesheetEntryEntity)
    private entriesRepo: Repository<TimesheetEntryEntity>,
    @InjectRepository(TimesheetEntity)
    private timesheetsRepo: Repository<TimesheetEntity>,
  ) {}

  async sumEntryHours(filter: HoursFilter = {}): Promise<number> {
    const qb = this.entriesRepo
      .createQueryBuilder('entry')
      .innerJoin('entry.timesheet', 'ts')
      .select('COALESCE(SUM(entry.hours_worked), 0)', 'total');

    if (filter.accountId) {
      qb.andWhere('ts.account_id = :accountId', { accountId: filter.accountId });
    }
    if (filter.projectId) {
      qb.andWhere('ts.project_id = :projectId', { projectId: filter.projectId });
    }
    if (filter.taskerId) {
      qb.andWhere('ts.tasker_id = :taskerId', { taskerId: filter.taskerId });
    }
    if (filter.startDate) {
      qb.andWhere('entry.entry_date >= :startDate', {
        startDate: filter.startDate.toISOString().split('T')[0],
      });
    }
    if (filter.endDate) {
      qb.andWhere('entry.entry_date <= :endDate', {
        endDate: filter.endDate.toISOString().split('T')[0],
      });
    }

    const row = await qb.getRawOne();
    return Number(row?.total ?? 0);
  }

  async getBreakdownByAssignment(accountIds?: string[]): Promise<HoursBreakdownRow[]> {
    const qb = this.entriesRepo
      .createQueryBuilder('entry')
      .innerJoin('entry.timesheet', 'ts')
      .select('ts.account_id', 'accountId')
      .addSelect('ts.project_id', 'projectId')
      .addSelect('ts.tasker_id', 'taskerId')
      .addSelect('COALESCE(SUM(entry.hours_worked), 0)', 'hours')
      .where('ts.account_id IS NOT NULL')
      .groupBy('ts.account_id')
      .addGroupBy('ts.project_id')
      .addGroupBy('ts.tasker_id');

    if (accountIds?.length) {
      qb.andWhere('ts.account_id IN (:...accountIds)', { accountIds });
    }

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      accountId: r.accountId,
      projectId: r.projectId,
      taskerId: r.taskerId,
      hours: Number(r.hours ?? 0),
    }));
  }

  /** Backfill account_id on legacy timesheets where exactly one account owns the project. */
  async backfillTimesheetAccounts(): Promise<number> {
    const result = await this.timesheetsRepo.query(`
      UPDATE timesheets t
      SET account_id = sub.account_id
      FROM (
        SELECT pa.project_id, MIN(pa.account_id::text)::uuid AS account_id
        FROM project_accounts pa
        WHERE pa.removed_at IS NULL
        GROUP BY pa.project_id
        HAVING COUNT(DISTINCT pa.account_id) = 1
      ) sub
      WHERE t.project_id = sub.project_id
        AND t.account_id IS NULL
    `);
    return result?.[1] ?? 0;
  }
}
