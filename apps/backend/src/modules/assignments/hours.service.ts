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
      .select('COALESCE(SUM(ROUND(entry.hours_worked * 60)), 0)', 'totalMinutes');

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
        startDate: `${filter.startDate.getFullYear()}-${String(filter.startDate.getMonth() + 1).padStart(2, '0')}-${String(filter.startDate.getDate()).padStart(2, '0')}`,
      });
    }
    if (filter.endDate) {
      qb.andWhere('entry.entry_date <= :endDate', {
        endDate: `${filter.endDate.getFullYear()}-${String(filter.endDate.getMonth() + 1).padStart(2, '0')}-${String(filter.endDate.getDate()).padStart(2, '0')}`,
      });
    }

    const row = await qb.getRawOne();
    return Number(row?.totalMinutes ?? 0) / 60;
  }

  async sumTaskerPayout(taskerId: string): Promise<number> {
    const qb = this.entriesRepo
      .createQueryBuilder('entry')
      .innerJoin('entry.timesheet', 'ts')
      .innerJoin('ts.project', 'project')
      .select('SUM(ROUND(entry.hours_worked * 60) * (COALESCE(project.price_per_hour, 0) / 60))', 'totalPayout')
      .where('ts.tasker_id = :taskerId', { taskerId });

    const row = await qb.getRawOne();
    return Number(row?.totalPayout ?? 0);
  }

  async getBreakdownByAssignment(accountIds?: string[]): Promise<HoursBreakdownRow[]> {
    const qb = this.entriesRepo
      .createQueryBuilder('entry')
      .innerJoin('entry.timesheet', 'ts')
      .select('ts.account_id', 'accountId')
      .addSelect('ts.project_id', 'projectId')
      .addSelect('ts.tasker_id', 'taskerId')
      .addSelect('COALESCE(SUM(ROUND(entry.hours_worked * 60)), 0)', 'totalMinutes')
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
      hours: Number(r.totalMinutes ?? 0) / 60,
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
