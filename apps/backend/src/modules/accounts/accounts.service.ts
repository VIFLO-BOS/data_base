/**
 * Accounts Service
 * TODO: Implement business logic for accounts.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountsRepo: Repository<AccountEntity>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const qb = this.accountsRepo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('account.projects', 'project')
      .leftJoinAndSelect('project.taskers', 'tasker')
      .leftJoinAndSelect('project.timesheets', 'timesheet')
      .orderBy('account.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    const enriched = data.map((account) => {
      let accountTotalHours = 0;
      if (account.projects) {
        account.projects.forEach(project => {
          const projectHours = (project.timesheets || []).reduce(
            (sum: number, ts: any) => sum + Number(ts.totalHours || 0),
            0
          );
          project.totalHours = projectHours;
          accountTotalHours += projectHours;
        });
      }
      return {
        ...account,
        totalHours: accountTotalHours,
      };
    });

    return {
      data: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const account = await this.accountsRepo.findOne({
      where: { id },
      relations: ['owner', 'projects', 'projects.taskers'],
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async create(dto: CreateAccountDto, userId: string) {
    const account = this.accountsRepo.create({ ...dto, ownerId: userId });
    return this.accountsRepo.save(account);
  }

  async update(id: string, dto: UpdateAccountDto) {
    const account = await this.findById(id);
    Object.assign(account, dto);
    return this.accountsRepo.save(account);
  }

  async delete(id: string) {
    const account = await this.findById(id);
    await this.accountsRepo.remove(account);
    return { message: 'Account deleted' };
  }
}