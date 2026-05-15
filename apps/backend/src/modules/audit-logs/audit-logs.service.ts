/**
 * AuditLogs Service
 * TODO: Implement business logic for audit-logs.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditLogsRepo: Repository<AuditLogEntity>,
  ) {}

  async findAll(filter: AuditLogFilterDto, page = 1, limit = 50) {
    const qb = this.auditLogsRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.action)
      qb.andWhere('log.action = :action', { action: filter.action });
    if (filter.resource)
      qb.andWhere('log.resource = :resource', { resource: filter.resource });
    if (filter.userId)
      qb.andWhere('log.userId = :userId', { userId: filter.userId });
    if (filter.startDate)
      qb.andWhere('log.createdAt >= :startDate', {
        startDate: filter.startDate,
      });
    if (filter.endDate)
      qb.andWhere('log.createdAt <= :endDate', { endDate: filter.endDate });

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Call this from other services to log an action.
   * Example: this.auditLogsService.log({ userId, action: 'project.create', resource: 'projects', resourceId: project.id });
   */
  async log(entry: Partial<AuditLogEntity>) {
    const log = this.auditLogsRepo.create(entry);
    return this.auditLogsRepo.save(log);
  }
}