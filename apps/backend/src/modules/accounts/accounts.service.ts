/**
 * Accounts Service
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AccountEntity } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { HoursService } from '../assignments/hours.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { AccountProjectTaskerEntity } from '../assignments/entities/account-project-tasker.entity';
import { ProjectAccountEntity } from '../assignments/entities/project-account.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountsRepo: Repository<AccountEntity>,
    @InjectRepository(AccountProjectTaskerEntity)
    private aptRepo: Repository<AccountProjectTaskerEntity>,
    @InjectRepository(ProjectAccountEntity)
    private paRepo: Repository<ProjectAccountEntity>,
    @InjectRepository(TimesheetEntity)
    private timesheetsRepo: Repository<TimesheetEntity>,
    private hoursService: HoursService,
    private assignmentsService: AssignmentsService,
  ) {}

  async findAll(page = 1, limit = 20) {
    const qb = this.accountsRepo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect(
        'account.projectAccounts',
        'pa',
        'pa.removed_at IS NULL',
      )
      .leftJoinAndSelect('pa.project', 'project')
      .orderBy('account.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const accountIds = data.map((a) => a.id);

    const assignments =
      accountIds.length > 0
        ? await this.aptRepo.find({
            where: { accountId: In(accountIds) },
            relations: ['tasker', 'tasker.user', 'project'],
          })
        : [];

    const hoursBreakdown =
      accountIds.length > 0
        ? await this.hoursService.getBreakdownByAssignment(accountIds)
        : [];

    const hoursMap = new Map<string, number>();
    const projectHoursMap = new Map<string, number>();
    const taskerHoursMap = new Map<string, number>();

    for (const row of hoursBreakdown) {
      const aptKey = `${row.accountId}:${row.projectId}:${row.taskerId}`;
      taskerHoursMap.set(aptKey, row.hours);
      const projKey = `${row.accountId}:${row.projectId}`;
      projectHoursMap.set(
        projKey,
        (projectHoursMap.get(projKey) || 0) + row.hours,
      );
      hoursMap.set(
        row.accountId,
        (hoursMap.get(row.accountId) || 0) + row.hours,
      );
    }

    const assignmentsByAccount = new Map<
      string,
      AccountProjectTaskerEntity[]
    >();
    for (const a of assignments) {
      const list = assignmentsByAccount.get(a.accountId) || [];
      list.push(a);
      assignmentsByAccount.set(a.accountId, list);
    }

    const enriched = data.map((account) => {
      const projects = (account.projectAccounts || [])
        .filter((pa) => !pa.removedAt)
        .map((pa) => {
          const project = pa.project;
          const projectAssignments = (
            assignmentsByAccount.get(account.id) || []
          ).filter((apt) => apt.projectId === project.id);
          const taskers = projectAssignments.map((apt) => {
            const aptKey = `${account.id}:${project.id}:${apt.taskerId}`;
            return {
              ...apt.tasker,
              assignmentStatus: apt.status,
              assignmentId: apt.id,
              hours: taskerHoursMap.get(aptKey) || 0,
            };
          });
          const projKey = `${account.id}:${project.id}`;
          return {
            ...project,
            totalHours: projectHoursMap.get(projKey) || 0,
            taskers,
            assignments: projectAssignments,
          };
        });

      return {
        ...account,
        projects,
        totalHours: hoursMap.get(account.id) || 0,
      };
    });

    return {
      data: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const list = await this.findAll(1, 1000);
    const account = list.data.find((a) => a.id === id);
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async create(dto: CreateAccountDto, userId: string) {
    const account = this.accountsRepo.create({ ...dto, ownerId: userId });
    return this.accountsRepo.save(account);
  }

  async update(id: string, dto: UpdateAccountDto) {
    const account = await this.accountsRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');
    Object.assign(account, dto);
    return this.accountsRepo.save(account);
  }

  async delete(id: string) {
    const account = await this.accountsRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');

    // Remove account-project-tasker assignments
    await this.aptRepo.delete({ accountId: id } as any);

    // Remove project-account links
    try {
      await this.paRepo.delete({ accountId: id } as any);
    } catch (e) {
      // paRepo may not be available in some setups; ignore errors
    }

    // Remove timesheets tied to this account (and their entries via cascade)
    try {
      await this.timesheetsRepo.delete({ accountId: id } as any);
    } catch (e) {
      // ignore if timesheets table differs in schema
    }

    // Finally remove the account record
    await this.accountsRepo.delete({ id } as any);
    return { message: 'Account deleted' };
  }
}
