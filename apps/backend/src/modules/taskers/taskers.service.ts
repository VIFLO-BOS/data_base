/**
 * Taskers Service
 * TODO: Implement business logic for taskers.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskerEntity } from './entities/tasker.entity';
import { TaskerPaymentEntity } from './entities/tasker-payment.entity';
import { CreateTaskerDto } from './dto/create-tasker.dto';
import { UpdateTaskerDto } from './dto/update-tasker.dto';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';
import { TimesheetEntryEntity } from '../timesheets/entities/timesheet-entry.entity';

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
  ) {}

  async findAll(page = 1, limit = 20, status?: string) {
    const qb = this.taskersRepo
      .createQueryBuilder('tasker')
      .leftJoinAndSelect('tasker.user', 'user')
      .leftJoinAndSelect('tasker.projects', 'projects')
      .leftJoinAndSelect('projects.accounts', 'accounts')
      .leftJoinAndSelect('tasker.timesheets', 'timesheets')
      .orderBy('tasker.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.where('tasker.availability_status = :status', { status });
    const [data, total] = await qb.getManyAndCount();

    // Compute totalHours from summed timesheets since it is not stored as a column
    const enriched = data.map((tasker) => ({
      ...tasker,
      totalHours: (tasker.timesheets || []).reduce(
        (sum: number, ts: any) => sum + Number(ts.totalHours || 0),
        0,
      ),
    }));

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
        'projects',
        'projects.accounts',
        'payments',
        'payments.project',
        'timesheets',
        'timesheets.entries',
        'timesheets.project',
      ],
    });
    if (!tasker) throw new NotFoundException('Tasker not found');
    return tasker;
  }

  async create(dto: CreateTaskerDto) {
    const tasker = this.taskersRepo.create(dto);
    return this.taskersRepo.save(tasker);
  }

  async update(id: string, dto: UpdateTaskerDto) {
    const tasker = await this.findById(id);
    Object.assign(tasker, dto);
    return this.taskersRepo.save(tasker);
  }

  async delete(id: string) {
    const tasker = await this.findById(id);
    await this.taskersRepo.remove(tasker);
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
    const tasker = await this.findById(taskerId);
    
    // Determine the weekStarting date (Monday) for the given date
    const d = new Date(payload.date);
    const diffToMonday = d.getDay() === 0 ? -6 : 1 - d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const weekStarting = monday.toISOString().split('T')[0];

    // Find or create the timesheet for this week, tasker, and project
    let timesheet = await this.timesheetsRepo.findOne({
      where: {
        taskerId: tasker.id,
        projectId: payload.projectId || null,
        weekStarting: new Date(weekStarting),
      },
      relations: ['entries'],
    });

    if (!timesheet) {
      timesheet = this.timesheetsRepo.create({
        taskerId: tasker.id,
        projectId: payload.projectId || null,
        weekStarting: new Date(weekStarting),
        status: 'draft',
        totalHours: 0,
      });
      await this.timesheetsRepo.save(timesheet);
      timesheet.entries = [];
    }

    // Insert the entry
    const entry = this.entriesRepo.create({
      timesheetId: timesheet.id,
      entryDate: new Date(payload.date),
      hoursWorked: payload.hours,
      taskDescription: payload.casualties,
    });
    await this.entriesRepo.save(entry);

    // Recalculate total hours for timesheet
    const allEntries = await this.entriesRepo.find({ where: { timesheetId: timesheet.id } });
    const total = allEntries.reduce((sum, e) => sum + Number(e.hoursWorked), 0);
    timesheet.totalHours = total;
    await this.timesheetsRepo.save(timesheet);

    return entry;
  }

  async updatePayment(paymentId: string, payload: any) {
    const payment = await this.paymentsRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    Object.assign(payment, payload);
    return this.paymentsRepo.save(payment);
  }

  async updateDailyHour(hourId: string, payload: any) {
    // hourId maps to the TimesheetEntryEntity ID
    const entry = await this.entriesRepo.findOne({ where: { id: hourId } });
    if (!entry) throw new NotFoundException('Daily hour entry not found');
    
    if (payload.hours !== undefined) entry.hoursWorked = payload.hours;
    if (payload.date !== undefined) entry.entryDate = new Date(payload.date);
    if (payload.casualties !== undefined) entry.taskDescription = payload.casualties;

    await this.entriesRepo.save(entry);

    // Recalculate total hours on timesheet
    const allEntries = await this.entriesRepo.find({ where: { timesheetId: entry.timesheetId } });
    const total = allEntries.reduce((sum, e) => sum + Number(e.hoursWorked), 0);
    await this.timesheetsRepo.update(entry.timesheetId, { totalHours: total });

    return entry;
  }
}
