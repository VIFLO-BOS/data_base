/**
 * Reports Service
 * TODO: Implement business logic for reports.
 */

import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from './entities/report.entity';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private reportsRepo: Repository<ReportEntity>,
  ) {}

  async findAll(filter: ReportFilterDto, page = 1, limit = 20) {
    const qb = this.reportsRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.generator', 'generator')
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.type) qb.andWhere('report.type = :type', { type: filter.type });
    if (filter.startDate)
      qb.andWhere('report.createdAt >= :startDate', {
        startDate: filter.startDate,
      });
    if (filter.endDate)
      qb.andWhere('report.createdAt <= :endDate', { endDate: filter.endDate });

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const report = await this.reportsRepo.findOne({
      where: { id },
      relations: ['generator'],
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async generate(_dto: GenerateReportDto, _userId: string) {
    throw new ServiceUnavailableException('Report generation is currently unavailable');
  }

  async delete(id: string) {
    const report = await this.findById(id);
    await this.reportsRepo.remove(report);
    return { message: 'Report deleted' };
  }
}