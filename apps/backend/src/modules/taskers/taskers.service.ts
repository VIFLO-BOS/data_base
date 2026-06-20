/**
 * Taskers Service
 */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskerEntity } from './entities/tasker.entity';
import { TaskerPaymentEntity } from './entities/tasker-payment.entity';
import { CreateTaskerDto } from './dto/create-tasker.dto';
import { UpdateTaskerDto } from './dto/update-tasker.dto';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';
import { TimesheetEntryEntity } from '../timesheets/entities/timesheet-entry.entity';
import { HoursService } from '../assignments/hours.service';
import { AssignmentsService } from '../assignments/assignments.service';

@Injectable()
export class TaskersService {
  constructor(
    @InjectRepository(TaskerEntity)
    private taskersRepo: Repository<TaskerEntity>,
    @InjectRepository(TaskerPaymentEntity)
    private paymentsRepo: Repository<TaskerPaymentEntity>,
    @InjectRepository(TimesheetEntity)
    private timesheetsRepo: Repository<TimesheetEntity>,
    @InjectRepository(TimesheetEntryEntity)
    private entriesRepo: Repository<TimesheetEntryEntity>,
    private hoursService: HoursService,
    private assignmentsService: AssignmentsService,
  ) {}

  async findAll(page = 1, limit = 20, status?: string) {
    const qb = this.taskersRepo
      .createQueryBuilder('tasker')
      .leftJoinAndSelect('tasker.user', 'user')
      .orderBy('tasker.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.where('tasker.availability_status = :status', { status });
    const [data, total] = await qb.getManyAndCount();

    const enriched = await Promise.all(
      data.map(async (tasker) => {
        const assignments = await this.assignmentsService.getAssignmentsForTasker(tasker.id);
        
        // Group assignments by project
        const projectsMap = new Map<string, any>();
        for (const a of assignments) {
          if (!projectsMap.has(a.projectId)) {
            projectsMap.set(a.projectId, {
              ...a.project,
              accounts: [],
            });
          }
          if (a.account) {
            // Avoid duplicates
            if (!projectsMap.get(a.projectId).accounts.find((acc: any) => acc.id === a.accountId)) {
               projectsMap.get(a.projectId).accounts.push(a.account);
            }
          }
        }

        const totalHours = await this.hoursService.sumEntryHours({
          taskerId: tasker.id,
        });

        const exactPayout = await this.hoursService.sumTaskerPayout(tasker.id);
        const totalAmount = exactPayout > 0 
          ? `₦${exactPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : '₦0.00';

        return {
          ...tasker,
          projects: Array.from(projectsMap.values()),
          totalHours,
          totalAmount,
        };
      }),
    );

    return {
      data: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const tasker = await this.taskersRepo.findOne({
      where: { id },
      relations: [
        'user',
        'payments',
        'payments.project',
        'timesheets',
        'timesheets.entries',
        'timesheets.project',
        'timesheets.account',
      ],
    });
    if (!tasker) throw new NotFoundException('Tasker not found');
    
    const assignments = await this.assignmentsService.getAssignmentsForTasker(tasker.id);
    const projectsMap = new Map<string, any>();
    
    for (const a of assignments) {
      if (!projectsMap.has(a.projectId)) {
        projectsMap.set(a.projectId, {
          ...a.project,
          accounts: [],
        });
      }
      if (a.account) {
        if (!projectsMap.get(a.projectId).accounts.find((acc: any) => acc.id === a.accountId)) {
           projectsMap.get(a.projectId).accounts.push(a.account);
        }
      }
    }

    const totalHours = await this.hoursService.sumEntryHours({
      taskerId: tasker.id,
    });

    const exactPayout = await this.hoursService.sumTaskerPayout(tasker.id);
    const totalAmount = exactPayout > 0 
      ? `₦${exactPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : '₦0.00';

    return {
      ...tasker,
      projects: Array.from(projectsMap.values()),
      totalHours,
      totalAmount,
    };
  }

  async create(dto: CreateTaskerDto) {
    const tasker = this.taskersRepo.create(dto);
    return this.taskersRepo.save(tasker);
  }

  async update(id: string, dto: UpdateTaskerDto) {
    const tasker = await this.taskersRepo.findOne({ where: { id } });
    if (!tasker) throw new NotFoundException('Tasker not found');
    Object.assign(tasker, dto);
    return this.taskersRepo.save(tasker);
  }

  async delete(id: string) {
    const tasker = await this.taskersRepo.findOne({ where: { id } });
    if (!tasker) throw new NotFoundException('Tasker not found');

    // Remove payments
    try {
      await this.paymentsRepo.delete({ taskerId: id } as any);
    } catch (e) {
      // ignore
    }

    // Remove timesheets (entries will be removed via ON DELETE CASCADE)
    try {
      await this.timesheetsRepo.delete({ taskerId: id } as any);
    } catch (e) {
      // ignore
    }

    // Delete the tasker record (this should cascade assignment links in DB)
    await this.taskersRepo.delete({ id } as any);
    return { message: 'Tasker deleted' };
  }

  async addPayment(taskerId: string, payload: any) {
    const tasker = await this.findById(taskerId);
    const payment = this.paymentsRepo.create({
      ...payload,
      taskerId: tasker.id,
    });
    return this.paymentsRepo.save(payment);
  }

  async addDailyHour(taskerId: string, payload: any) {
    const { accountId, projectId, date, hours, casualties } = payload;
    if (!accountId || !projectId) {
      throw new BadRequestException('accountId and projectId are required');
    }

    await this.assignmentsService.assertCanLogHours(
      accountId,
      projectId,
      taskerId,
    );

    const d = new Date(date);
    const diffToMonday = d.getDay() === 0 ? -6 : 1 - d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const weekStarting = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

    let timesheet = await this.timesheetsRepo.findOne({
      where: {
        taskerId,
        projectId,
        accountId,
        weekStarting: weekStarting as any,
      },
      relations: ['entries'],
    });

    if (!timesheet) {
      timesheet = this.timesheetsRepo.create({
        taskerId,
        projectId,
        accountId,
        weekStarting: weekStarting as any,
        status: 'draft',
        totalHours: 0,
      });
      // Capture the returned saved entity to ensure the generated id is populated.
      timesheet = await this.timesheetsRepo.save(timesheet);
      if (!timesheet.id) {
        throw new Error('Failed to create timesheet (missing id)');
      }
    }

    const entry = this.entriesRepo.create({
      timesheetId: timesheet.id,
      entryDate: date as any,
      hoursWorked: hours,
      taskDescription: casualties,
    });
    await this.entriesRepo.save(entry);

    const allEntries = await this.entriesRepo.find({
      where: { timesheetId: timesheet.id },
    });
    const total = allEntries.reduce((sum, e) => sum + Number(e.hoursWorked), 0);
    await this.timesheetsRepo.update(timesheet.id, { totalHours: total });

    return entry;
  }

  async updatePayment(paymentId: string, payload: any) {
    const payment = await this.paymentsRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    Object.assign(payment, payload);
    return this.paymentsRepo.save(payment);
  }

  async updateDailyHour(hourId: string, payload: any) {
    const entry = await this.entriesRepo.findOne({
      where: { id: hourId },
      relations: ['timesheet'],
    });
    if (!entry) throw new NotFoundException('Daily hour entry not found');

    if (payload.hours !== undefined) entry.hoursWorked = payload.hours;
    if (payload.date !== undefined) entry.entryDate = payload.date as any;
    if (payload.casualties !== undefined)
      entry.taskDescription = payload.casualties;

    await this.entriesRepo.save(entry);

    const allEntries = await this.entriesRepo.find({
      where: { timesheetId: entry.timesheetId },
    });
    const total = allEntries.reduce((sum, e) => sum + Number(e.hoursWorked), 0);
    await this.timesheetsRepo.update(entry.timesheetId, { totalHours: total });

    return entry;
  }
}
