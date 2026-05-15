/**
 * Permissions Service
 * TODO: Implement business logic for permissions.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private permsRepo: Repository<PermissionEntity>,
  ) {}

  async findAll() {
    return this.permsRepo.find({ order: { resource: 'ASC', action: 'ASC' } });
  }

  async findByResourceAction(resource: string, action: string) {
    return this.permsRepo.findOne({ where: { resource, action } });
  }
}