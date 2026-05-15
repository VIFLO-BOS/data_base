/**
 * Taskers Service
 * TODO: Implement business logic for taskers.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskerEntity } from './entities/tasker.entity';
import { CreateTaskerDto } from './dto/create-tasker.dto';
import { UpdateTaskerDto } from './dto/update-tasker.dto';

@Injectable()
export class TaskersService {
  constructor(
    @InjectRepository(TaskerEntity)
    private taskersRepo: Repository<TaskerEntity>,
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
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const tasker = await this.taskersRepo.findOne({
      where: { id },
      relations: ['user'],
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
}