/**
 * Clients Service
 * TODO: Implement business logic for clients.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientEntity)
    private clientsRepo: Repository<ClientEntity>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.clientsRepo.findAndCount({
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
    const client = await this.clientsRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(dto: CreateClientDto) {
    const client = this.clientsRepo.create(dto);
    return this.clientsRepo.save(client);
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.findById(id);
    Object.assign(client, dto);
    return this.clientsRepo.save(client);
  }

  async delete(id: string) {
    const client = await this.findById(id);
    await this.clientsRepo.remove(client);
    return { message: 'Client deleted' };
  }
}