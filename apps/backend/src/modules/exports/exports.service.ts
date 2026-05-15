/**
 * Exports Service
 * TODO: Implement business logic for exports.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportJobEntity } from './entities/export-job.entity';
import { ExportRequestDto } from './dto/export-request.dto';
import { ExportFilterDto } from './dto/export-filter.dto';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(ExportJobEntity)
    private exportsRepo: Repository<ExportJobEntity>,
  ) {}

  async findAll(filter: ExportFilterDto, page = 1, limit = 20) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;

    const [data, total] = await this.exportsRepo.findAndCount({
      where,
      relations: ['requester'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const job = await this.exportsRepo.findOne({
      where: { id },
      relations: ['requester'],
    });
    if (!job) throw new NotFoundException('Export job not found');
    return job;
  }

  async requestExport(dto: ExportRequestDto, userId: string) {
    const job = this.exportsRepo.create({
      type: dto.type,
      resource: dto.resource,
      filters: dto.filters,
      requestedBy: userId,
      status: 'queued',
    });
    const saved = await this.exportsRepo.save(job);

    // TODO: In a real app, dispatch a background job here (e.g., Bull queue)
    // For now, simulate immediate completion:
    saved.status = 'completed';
    saved.completedAt = new Date();
    saved.fileUrl = `/exports/${saved.id}.${dto.type}`;
    return this.exportsRepo.save(saved);
  }

  async delete(id: string) {
    const job = await this.findById(id);
    await this.exportsRepo.remove(job);
    return { message: 'Export job deleted' };
  }
}