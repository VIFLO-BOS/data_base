/**
 * Admins Service
 * TODO: Implement business logic for admins.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminEntity)
    private adminsRepo: Repository<AdminEntity>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.adminsRepo.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const admin = await this.adminsRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async create(dto: CreateAdminDto) {
    const admin = this.adminsRepo.create(dto);
    return this.adminsRepo.save(admin);
  }

  async update(id: string, dto: UpdateAdminDto) {
    const admin = await this.findById(id);
    Object.assign(admin, dto);
    return this.adminsRepo.save(admin);
  }

  async delete(id: string) {
    const admin = await this.findById(id);
    await this.adminsRepo.remove(admin);
    return { message: 'Admin deleted' };
  }
}