/**
 * Timesheets Service
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimesheetEntity } from './entities/timesheet.entity';
import { TimesheetEntryEntity } from './entities/timesheet-entry.entity';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { AssignmentsService } from '../assignments/assignments.service';
import { TaskerPaymentEntity } from '../taskers/entities/tasker-payment.entity';

@Injectable()
export class TimesheetsService {
  constructor(
    @InjectRepository(TimesheetEntity)
    private timesheetsRepo: Repository<TimesheetEntity>,
    @InjectRepository(TimesheetEntryEntity)
    private entriesRepo: Repository<TimesheetEntryEntity>,
    @InjectRepository(TaskerPaymentEntity)
    private paymentsRepo: Repository<TaskerPaymentEntity>,
    private assignmentsService: AssignmentsService,
  ) {}

  async findAll(page = 1, limit = 20, status?: string, weekStarting?: string) {
    // If filtering by status, use the original timesheet-only query
    if (status) {
      const qb = this.timesheetsRepo
        .createQueryBuilder('ts')
        .leftJoinAndSelect('ts.tasker', 'tasker')
        .leftJoinAndSelect('tasker.user', 'user')
        .leftJoinAndSelect('ts.project', 'project')
        .leftJoinAndSelect('ts.account', 'account')
        .leftJoinAndSelect('ts.entries', 'entries')
        .where('ts.status = :status', { status })
        .orderBy('ts.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      if (weekStarting) {
        qb.andWhere('ts.weekStarting = :weekStarting', { weekStarting });
      }
      const [data, total] = await qb.getManyAndCount();
      const cleanData = data.map((ts) => {
        if (ts.entries) {
          ts.entries = ts.entries.map((e) => {
            const { timesheet, ...rest } = e as any;
            return {
              ...rest,
              entryDate: e.entryDate instanceof Date
                ? `${e.entryDate.getFullYear()}-${String(e.entryDate.getMonth() + 1).padStart(2, '0')}-${String(e.entryDate.getDate()).padStart(2, '0')}`
                : String(e.entryDate).split('T')[0]
            };
          }) as any;
        }
        return {
          ...ts,
          weekStarting: ts.weekStarting instanceof Date
            ? `${ts.weekStarting.getFullYear()}-${String(ts.weekStarting.getMonth() + 1).padStart(2, '0')}-${String(ts.weekStarting.getDate()).padStart(2, '0')}`
            : String(ts.weekStarting).split('T')[0]
        };
      });
      return {
        data: cleanData,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    // Timeline View: return ALL active assignments, merged with their timesheets
    const { data: assignments, total } = await this.assignmentsService.getAllActiveAssignments(page, limit);

    // Build a timesheet query based on what period we're in
    const tsQb = this.timesheetsRepo
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.entries', 'entries');

    if (weekStarting) {
      tsQb.where('ts.weekStarting = :weekStarting', { weekStarting });
    }

    const existingTimesheets = await tsQb.getMany();

    let paymentSums: any[] = [];
    if (assignments.length > 0) {
      const taskerIds = [...new Set(assignments.map(a => a.taskerId))];
      paymentSums = await this.paymentsRepo
        .createQueryBuilder('p')
        .select('p.taskerId', 'taskerId')
        .addSelect('p.projectId', 'projectId')
        .addSelect('SUM(p.amount)', 'total')
        .where('p.taskerId IN (:...taskerIds)', { taskerIds })
        .groupBy('p.taskerId')
        .addGroupBy('p.projectId')
        .getRawMany();
    }

    const mappedData = assignments.map(a => {
      // Find ALL matching timesheets for this assignment (could be multiple weeks)
      const matchingTimesheets = existingTimesheets.filter(ts =>
        ts.taskerId === a.taskerId &&
        ts.projectId === a.projectId &&
        ts.accountId === a.accountId
      );

      let totalHours = 0;
      let allEntries: any[] = [];
      let primaryTs: any = null;

      if (matchingTimesheets.length > 0) {
        // Merge all entries from all matching timesheets into one row
        allEntries = matchingTimesheets.flatMap(ts =>
          (ts.entries || []).map(e => {
            const { timesheet, ...rest } = e as any;
            return {
              ...rest,
              entryDate: e.entryDate instanceof Date
                ? `${e.entryDate.getFullYear()}-${String(e.entryDate.getMonth() + 1).padStart(2, '0')}-${String(e.entryDate.getDate()).padStart(2, '0')}`
                : String(e.entryDate).split('T')[0]
            };
          })
        );
        const totalMinutes = allEntries.reduce((sum, e) => sum + Math.round(Number(e.hoursWorked || 0) * 60), 0);
        totalHours = totalMinutes / 60;
        primaryTs = matchingTimesheets[0];
      }

      // Calculate the exact payout based on exact minutes and project's price per hour
      const hourlyRate = Number(a.project?.pricePerHour || 0);
      const exactMinutes = Math.round(totalHours * 60);
      const exactPayout = exactMinutes * (hourlyRate / 60);
      
      const totalAmount = exactPayout > 0 
        ? `₦${exactPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
        : '₦0.00';

      if (primaryTs) {
        return {
          ...primaryTs,
          entries: allEntries,
          totalHours,
          totalAmount,
          rawAmount: exactPayout, // Include raw amount for frontend use
          tasker: a.tasker,
          project: a.project,
          account: a.account,
          weekStarting: primaryTs.weekStarting instanceof Date
            ? `${primaryTs.weekStarting.getFullYear()}-${String(primaryTs.weekStarting.getMonth() + 1).padStart(2, '0')}-${String(primaryTs.weekStarting.getDate()).padStart(2, '0')}`
            : String(primaryTs.weekStarting).split('T')[0],
        };
      } else {
        // Virtual row — tasker assigned but no timesheet exists yet
        const now = new Date();
        const virtualWeek = weekStarting || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return {
          id: `virtual|${a.taskerId}|${a.projectId}|${a.accountId}|${virtualWeek}`,
          taskerId: a.taskerId,
          projectId: a.projectId,
          accountId: a.accountId,
          weekStarting: virtualWeek,
          status: 'draft',
          totalHours: 0,
          totalAmount,
          rawAmount: 0,
          entries: [],
          tasker: a.tasker,
          project: a.project,
          account: a.account,
        };
      }
    });

    return {
      data: mappedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const ts = await this.timesheetsRepo.findOne({
      where: { id },
      relations: ['tasker', 'tasker.user', 'project', 'account', 'entries', 'approver'],
    });
    if (!ts) throw new NotFoundException('Timesheet not found');
    return ts;
  }

  async create(dto: CreateTimesheetDto & { accountId?: string }) {
    if (!dto.accountId) {
      throw new BadRequestException('accountId is required');
    }
    await this.assignmentsService.assertCanLogHours(
      dto.accountId,
      dto.projectId,
      dto.taskerId,
    );

    const totalHours = dto.entries.reduce((sum, e) => sum + e.hoursWorked, 0);
    const timesheet = this.timesheetsRepo.create({
      taskerId: dto.taskerId,
      projectId: dto.projectId,
      accountId: dto.accountId,
      weekStarting: dto.weekStarting as any,
      totalHours,
      entries: dto.entries as any,
    });
    return this.timesheetsRepo.save(timesheet);
  }

  async submit(id: string) {
    const ts = await this.findById(id);
    if (ts.status !== 'draft')
      throw new BadRequestException('Only draft timesheets can be submitted');
    ts.status = 'submitted';
    ts.submittedAt = new Date();
    return this.timesheetsRepo.save(ts);
  }

  async approve(id: string, approverId: string) {
    const ts = await this.findById(id);
    if (ts.status !== 'submitted')
      throw new BadRequestException(
        'Only submitted timesheets can be approved',
      );
    ts.status = 'approved';
    ts.approvedAt = new Date();
    ts.approvedBy = approverId;
    return this.timesheetsRepo.save(ts);
  }

  async reject(id: string, approverId: string) {
    const ts = await this.findById(id);
    if (ts.status !== 'submitted')
      throw new BadRequestException(
        'Only submitted timesheets can be rejected',
      );
    ts.status = 'rejected';
    ts.approvedBy = approverId;
    return this.timesheetsRepo.save(ts);
  }

  async updateEntry(
    timesheetId: string,
    entryDate: string,
    hoursWorked: number,
    taskDescription?: string,
  ) {
    try {
      let ts: TimesheetEntity;
      let actualTimesheetId = timesheetId;

      if (timesheetId.startsWith('virtual|')) {
        const [, taskerId, projectId, accountIdStr] = timesheetId.split('|');
        const accountId = accountIdStr === 'null' ? null : accountIdStr;
        
        // 1. Calculate the actual Monday of the entryDate strictly
        const [y, m, d] = entryDate.split('-').map(Number);
        const localDate = new Date(y, m - 1, d, 12, 0, 0); // Noon to avoid timezone shifts
        const day = localDate.getDay();
        const diff = localDate.getDate() - day + (day === 0 ? -6 : 1);
        localDate.setDate(diff);
        const correctWeekStarting = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

        // 2. See if the timesheet for this specific week actually exists
        ts = await this.timesheetsRepo.findOne({
          where: {
            taskerId,
            projectId,
            accountId: accountId || null,
            weekStarting: correctWeekStarting as any,
          },
          relations: ['entries'],
        });

        if (!ts) {
          ts = this.timesheetsRepo.create({
            taskerId,
            projectId,
            accountId,
            weekStarting: correctWeekStarting as any,
            status: 'draft',
            totalHours: 0,
          });
          ts = await this.timesheetsRepo.save(ts);
        }
        actualTimesheetId = ts.id;
      } else {
        ts = await this.findById(timesheetId);
      }

      if (ts.accountId && ts.projectId && ts.taskerId) {
        await this.assignmentsService.assertCanLogHours(
          ts.accountId,
          ts.projectId,
          ts.taskerId,
        );
      }

      let entry = ts.entries?.find(
        (e) => {
          // Normalize both sides to YYYY-MM-DD without going through UTC conversion
          const stored = e.entryDate instanceof Date
            ? `${e.entryDate.getFullYear()}-${String(e.entryDate.getMonth() + 1).padStart(2, '0')}-${String(e.entryDate.getDate()).padStart(2, '0')}`
            : String(e.entryDate).split('T')[0];
          return stored === entryDate;
        },
      );

      if (entry) {
        entry.hoursWorked = hoursWorked;
        if (taskDescription !== undefined) entry.taskDescription = taskDescription;
        await this.entriesRepo.save(entry);
      } else {
        const newEntry = this.entriesRepo.create({
          timesheetId: actualTimesheetId,
          entryDate: entryDate as any,
          hoursWorked,
          taskDescription,
        });
        await this.entriesRepo.save(newEntry);
      }

      const allEntries = await this.entriesRepo.find({
        where: { timesheetId: actualTimesheetId },
      });
      const totalMinutes = allEntries.reduce(
        (sum, e) => sum + Math.round(Number(e.hoursWorked) * 60),
        0,
      );
      const totalHours = totalMinutes / 60;
      await this.timesheetsRepo.update(actualTimesheetId, { totalHours });
      return this.timesheetsRepo.findOne({
        where: { id: actualTimesheetId },
        relations: ['tasker', 'tasker.user', 'project', 'account', 'entries'],
      });
    } catch (e: any) {
      console.error('ERROR IN updateEntry:', e);
      throw new BadRequestException(`DEBUG_500: ${e.message} \nStack: ${e.stack}`);
    }
  }
}
