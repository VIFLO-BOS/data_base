/**
 * Projects Service
 * TODO: Implement business logic for projects.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectsRepo: Repository<ProjectEntity>,
    @InjectRepository(TaskerEntity)
    private taskersRepo: Repository<TaskerEntity>,
  ) {}

  async findAll(page = 1, limit = 20, status?: string) {
    const qb = this.projectsRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.taskers', 'tasker')
      .leftJoinAndSelect('project.client', 'client')
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.where('project.status = :status', { status });

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const project = await this.projectsRepo.findOne({
      where: { id },
      relations: ['taskers', 'client', 'creator'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto, userId: string) {
    const project = this.projectsRepo.create({ ...dto, createdBy: userId });
    return this.projectsRepo.save(project);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findById(id);
    Object.assign(project, dto);
    return this.projectsRepo.save(project);
  }

  async delete(id: string) {
    const project = await this.findById(id);
    await this.projectsRepo.remove(project);
    return { message: 'Project deleted' };
  }

  async assignTasker(projectId: string, taskerId: string) {
    const project = await this.findById(projectId);
    const tasker = await this.taskersRepo.findOne({ where: { id: taskerId } });
    if (!tasker) throw new NotFoundException('Tasker not found');
    project.taskers = [...(project.taskers || []), tasker];
    return this.projectsRepo.save(project);
  }

  async removeTasker(projectId: string, taskerId: string) {
    const project = await this.findById(projectId);
    project.taskers = (project.taskers || []).filter((t) => t.id !== taskerId);
    return this.projectsRepo.save(project);
  }
}