/**
 * Timesheets Service
 * TODO: Implement business logic for timesheets.
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

@Injectable()
export class TimesheetsService {
  constructor(
    @InjectRepository(TimesheetEntity)
    private timesheetsRepo: Repository<TimesheetEntity>,
    @InjectRepository(TimesheetEntryEntity)
    private entriesRepo: Repository<TimesheetEntryEntity>,
  ) {}

  async findAll(page = 1, limit = 20, status?: string, weekStarting?: string) {
    const qb = this.timesheetsRepo
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.tasker', 'tasker')
      .leftJoinAndSelect('tasker.user', 'user')
      .leftJoinAndSelect('ts.project', 'project')
      .leftJoinAndSelect('ts.entries', 'entries')
      .orderBy('ts.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.where('ts.status = :status', { status });
    if (weekStarting) qb.andWhere('ts.weekStarting = :weekStarting', { weekStarting });
    const [data, total] = await qb.getManyAndCount();

    const cleanData = data.map(ts => {
      if (ts.entries) {
        ts.entries = ts.entries.map(e => {
          const { timesheet, ...rest } = e as any;
          return rest;
        }) as any;
      }
      return ts;
    });

    return {
      data: cleanData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const ts = await this.timesheetsRepo.findOne({
      where: { id },
      relations: ['tasker', 'tasker.user', 'project', 'entries', 'approver'],
    });
    if (!ts) throw new NotFoundException('Timesheet not found');
    return ts;
  }

  async create(dto: CreateTimesheetDto) {
    const totalHours = dto.entries.reduce((sum, e) => sum + e.hoursWorked, 0);
    const timesheet = this.timesheetsRepo.create({
      taskerId: dto.taskerId,
      projectId: dto.projectId,
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
    const ts = await this.findById(timesheetId);

    // Find existing entry for the date or create new
    let entry = ts.entries?.find(
      (e) =>
        new Date(e.entryDate).toISOString().split('T')[0] === entryDate,
    );

    if (entry) {
      entry.hoursWorked = hoursWorked;
      if (taskDescription !== undefined) entry.taskDescription = taskDescription;
      await this.entriesRepo.save(entry);
    } else {
      const newEntry = this.entriesRepo.create({
        timesheetId,
        entryDate: entryDate as any,
        hoursWorked,
        taskDescription,
      });
      await this.entriesRepo.save(newEntry);
    }

    // Recalculate total hours
    const allEntries = await this.entriesRepo.find({
      where: { timesheetId },
    });
    ts.totalHours = allEntries.reduce(
      (sum, e) => sum + Number(e.hoursWorked),
      0,
    );
    return this.timesheetsRepo.save(ts);
  }
}