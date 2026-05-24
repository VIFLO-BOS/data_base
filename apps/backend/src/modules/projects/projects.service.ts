/**
 * Projects Service
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { ProjectEntity } from './entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { AccountEntity } from '../accounts/entities/account.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignmentsService } from '../assignments/assignments.service';
import { HoursService } from '../assignments/hours.service';
import { ProjectAccountEntity } from '../assignments/entities/project-account.entity';
import { TimesheetEntity } from '../timesheets/entities/timesheet.entity';
import { AccountProjectTaskerEntity } from '../assignments/entities/account-project-tasker.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectsRepo: Repository<ProjectEntity>,
    @InjectRepository(TaskerEntity)
    private taskersRepo: Repository<TaskerEntity>,
    @InjectRepository(AccountEntity)
    private accountsRepo: Repository<AccountEntity>,
    @InjectRepository(ProjectAccountEntity)
    private paRepo: Repository<ProjectAccountEntity>,
    @InjectRepository(TimesheetEntity)
    private timesheetRepo: Repository<TimesheetEntity>,
    @InjectRepository(AccountProjectTaskerEntity)
    private aptRepo: Repository<AccountProjectTaskerEntity>,
    private assignmentsService: AssignmentsService,
    private hoursService: HoursService,
  ) {}

  private async attachAccountsAndHours(projects: ProjectEntity[]) {
    if (!projects.length) return projects;

    const projectIds = projects.map((p) => p.id);
    const links = await this.paRepo.find({
      where: { projectId: In(projectIds), removedAt: IsNull() },
      relations: ['account'],
    });

    const breakdown = await this.hoursService.getBreakdownByAssignment();
    const projectHoursMap = new Map<string, number>();

    for (const row of breakdown) {
      if (!projectIds.includes(row.projectId)) continue;
      projectHoursMap.set(
        row.projectId,
        (projectHoursMap.get(row.projectId) || 0) + row.hours,
      );
    }

    return projects.map((project) => {
      const accounts = links
        .filter((l) => l.projectId === project.id)
        .map((l) => l.account)
        .filter(Boolean);
      return {
        ...project,
        accounts,
        totalHours: projectHoursMap.get(project.id) || 0,
        accountsCount: accounts.length,
        taskersCount: project.taskers?.length || 0,
      };
    });
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const qb = this.projectsRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.taskers', 'tasker')
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.where('project.status = :status', { status });

    const [data, total] = await qb.getManyAndCount();
    const enriched = await this.attachAccountsAndHours(data);

    return {
      data: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const project = await this.projectsRepo.findOne({
      where: { id },
      relations: ['taskers', 'taskers.user', 'creator'],
    });
    if (!project) throw new NotFoundException('Project not found');

    const links = await this.paRepo.find({
      where: { projectId: id, removedAt: IsNull() },
      relations: ['account'],
    });
    project.accounts = links.map((l) => l.account).filter(Boolean);

    const enriched = (await this.attachAccountsAndHours([project]))[0];
    const accountAssignments = await Promise.all(
      links.map(async (link) => ({
        account: link.account,
        taskers: await this.assignmentsService.getAssignmentsForAccountProject(
          link.accountId,
          id,
        ),
      })),
    );

    return {
      ...enriched,
      accountAssignments,
    };
  }

  async create(dto: CreateProjectDto, userId: string) {
    const { taskerIds, accountIds, ...rest } = dto;
    const project = this.projectsRepo.create({ ...rest, createdBy: userId });
    const saved = await this.projectsRepo.save(project);

    if (accountIds?.length) {
      for (const accountId of accountIds) {
        await this.assignmentsService.linkAccountToProject(saved.id, accountId);
        if (taskerIds?.length) {
          for (const taskerId of taskerIds) {
            await this.assignmentsService.assignTasker(
              accountId,
              saved.id,
              taskerId,
            );
          }
        }
      }
    } else if (taskerIds?.length) {
      project.taskers = await this.taskersRepo.findBy({ id: In(taskerIds) });
      await this.projectsRepo.save({ ...saved, taskers: project.taskers });
    }

    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const { taskerIds, accountIds, ...rest } = dto as UpdateProjectDto & {
      taskerIds?: string[];
      accountIds?: string[];
    };
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    Object.assign(project, rest);
    await this.projectsRepo.save(project);

    if (accountIds) {
      for (const accountId of accountIds) {
        await this.assignmentsService.linkAccountToProject(id, accountId);
      }
    }

    return this.findById(id);
  }

  async delete(id: string) {
    const project = await this.findById(id);
    await this.projectsRepo.remove(project);
    return { message: 'Project deleted' };
  }

  /**
   * Permanent deletion of a project and all related data (admin-only).
   * Cascades through: timesheets → account_project_taskers → project_accounts → project.
   */
  async removePermanently(id: string) {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    // Delete all timesheets for this project (cascade will handle entries)
    await this.timesheetRepo.delete({ projectId: id });

    // Delete all account_project_taskers for this project (explicit cleanup)
    await this.aptRepo.delete({ projectId: id });

    // Delete all project_accounts for this project
    await this.paRepo.delete({ projectId: id });

    // Finally, delete the project record
    await this.projectsRepo.delete({ id });

    return { message: 'Project and all related data permanently deleted' };
  }

  async assignTasker(projectId: string, taskerId: string, accountId?: string) {
    if (accountId) {
      return this.assignmentsService.assignTasker(
        accountId,
        projectId,
        taskerId,
      );
    }
    const links = await this.paRepo.find({
      where: { projectId, removedAt: IsNull() },
    });
    if (links.length === 1) {
      return this.assignmentsService.assignTasker(
        links[0].accountId,
        projectId,
        taskerId,
      );
    }
    throw new NotFoundException(
      'accountId is required when project has multiple accounts',
    );
  }

  async removeTasker(projectId: string, taskerId: string, accountId?: string) {
    if (accountId) {
      return this.assignmentsService.removeTaskerAssignment(
        accountId,
        projectId,
        taskerId,
      );
    }
    const links = await this.paRepo.find({
      where: { projectId, removedAt: IsNull() },
    });
    if (links.length === 1) {
      return this.assignmentsService.removeTaskerAssignment(
        links[0].accountId,
        projectId,
        taskerId,
      );
    }
    throw new NotFoundException(
      'accountId is required when project has multiple accounts',
    );
  }

  async assignAccount(projectId: string, accountId: string) {
    return this.assignmentsService.linkAccountToProject(projectId, accountId);
  }

  async removeAccount(projectId: string, accountId: string) {
    return this.assignmentsService.unlinkAccountFromProject(
      projectId,
      accountId,
    );
  }
}
