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

  async findAll(page = 1, limit = 20, status?: string) {
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
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
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
}