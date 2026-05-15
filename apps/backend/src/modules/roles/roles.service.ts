/**
 * Roles Service
 * TODO: Implement business logic for roles.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private rolesRepo: Repository<RoleEntity>,
  ) {}

  async findAll() {
    return this.rolesRepo.find({ order: { name: 'ASC' } });
  }

  async findByName(name: string) {
    const role = await this.rolesRepo.findOne({ where: { name } });
    if (!role) throw new NotFoundException(`Role '${name}' not found`);
    return role;
  }
}