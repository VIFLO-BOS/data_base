import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  AccountProjectTaskerEntity,
  AssignmentStatus,
} from './entities/account-project-tasker.entity';
import { ProjectAccountEntity } from './entities/project-account.entity';
import { HoursService } from './hours.service';
import { ProjectEntity } from '../projects/entities/project.entity';
import { AccountEntity } from '../accounts/entities/account.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';

const ACTIVE_STATUSES: AssignmentStatus[] = ['active'];

@Injectable()
export class AssignmentsService implements OnModuleInit {
  constructor(
    @InjectRepository(AccountProjectTaskerEntity)
    private aptRepo: Repository<AccountProjectTaskerEntity>,
    @InjectRepository(ProjectAccountEntity)
    private paRepo: Repository<ProjectAccountEntity>,
    @InjectRepository(ProjectEntity)
    private projectsRepo: Repository<ProjectEntity>,
    @InjectRepository(AccountEntity)
    private accountsRepo: Repository<AccountEntity>,
    @InjectRepository(TaskerEntity)
    private taskersRepo: Repository<TaskerEntity>,
    private hoursService: HoursService,
  ) {}

  async onModuleInit() {
    await this.migrateLegacyProjectTaskers();
    await this.hoursService.backfillTimesheetAccounts();
  }

  /** Copy global project_taskers into account_project_taskers for single-account projects. */
  private async migrateLegacyProjectTaskers() {
    const links = await this.paRepo.find({ where: { removedAt: IsNull() } });
    const byProject = new Map<string, string[]>();
    for (const link of links) {
      const list = byProject.get(link.projectId) || [];
      list.push(link.accountId);
      byProject.set(link.projectId, list);
    }

    for (const [projectId, accountIds] of byProject) {
      if (accountIds.length !== 1) continue;
      const accountId = accountIds[0];
      const project = await this.projectsRepo.findOne({
        where: { id: projectId },
        relations: ['taskers'],
      });
      if (!project?.taskers?.length) continue;

      for (const tasker of project.taskers) {
        const exists = await this.aptRepo.findOne({
          where: { accountId, projectId, taskerId: tasker.id },
        });
        if (!exists) {
          await this.aptRepo.save(
            this.aptRepo.create({
              accountId,
              projectId,
              taskerId: tasker.id,
              status: 'active',
              assignedAt: new Date(),
            }),
          );
        }
      }
    }
  }

  async linkAccountToProject(projectId: string, accountId: string) {
    await this.assertProjectAndAccount(projectId, accountId);

    let link = await this.paRepo.findOne({
      where: { projectId, accountId },
    });

    if (link?.removedAt) {
      link.removedAt = null;
      link.assignedAt = new Date();
      return this.paRepo.save(link);
    }

    if (!link) {
      link = this.paRepo.create({
        projectId,
        accountId,
        assignedAt: new Date(),
      });
      await this.paRepo.save(link);
    }

    await this.syncProjectAccountsRelation(projectId);
    return link;
  }

  async unlinkAccountFromProject(projectId: string, accountId: string) {
    const link = await this.paRepo.findOne({ where: { projectId, accountId } });
    if (link) {
      link.removedAt = new Date();
      await this.paRepo.save(link);
    }
    await this.syncProjectAccountsRelation(projectId);
  }

  async assignTasker(
    accountId: string,
    projectId: string,
    taskerId: string,
    status: AssignmentStatus = 'active',
  ) {
    await this.assertProjectAndAccount(projectId, accountId);
    const tasker = await this.taskersRepo.findOne({ where: { id: taskerId } });
    if (!tasker) throw new NotFoundException('Tasker not found');

    await this.linkAccountToProject(projectId, accountId);

    let row = await this.aptRepo.findOne({
      where: { accountId, projectId, taskerId },
    });

    if (row) {
      row.status = status;
      row.removedAt = null;
      row.assignedAt = new Date();
      return this.aptRepo.save(row);
    }

    row = this.aptRepo.create({
      accountId,
      projectId,
      taskerId,
      status,
      assignedAt: new Date(),
    });
    const saved = await this.aptRepo.save(row);
    await this.syncProjectTaskersRelation(projectId, taskerId);
    return saved;
  }

  async updateAssignmentStatus(
    accountId: string,
    projectId: string,
    taskerId: string,
    status: AssignmentStatus,
  ) {
    const row = await this.aptRepo.findOne({
      where: { accountId, projectId, taskerId },
    });
    if (!row) throw new NotFoundException('Assignment not found');

    row.status = status;
    if (status === 'removed') {
      row.removedAt = new Date();
    } else {
      row.removedAt = null;
    }
    return this.aptRepo.save(row);
  }

  async removeTaskerAssignment(
    accountId: string,
    projectId: string,
    taskerId: string,
  ) {
    return this.updateAssignmentStatus(
      accountId,
      projectId,
      taskerId,
      'removed',
    );
  }

  async replaceTaskersForAccountProject(
    accountId: string,
    projectId: string,
    taskerIds: string[],
  ) {
    await this.linkAccountToProject(projectId, accountId);

    const existing = await this.aptRepo.find({
      where: { accountId, projectId },
    });
    const incoming = new Set(taskerIds);

    for (const row of existing) {
      if (!incoming.has(row.taskerId) && row.status === 'active') {
        row.status = 'removed';
        row.removedAt = new Date();
        await this.aptRepo.save(row);
      }
    }

    for (const taskerId of taskerIds) {
      await this.assignTasker(accountId, projectId, taskerId, 'active');
    }

    return this.getAssignmentsForAccount(accountId);
  }

  async getAssignmentsForAccount(accountId: string) {
    return this.aptRepo.find({
      where: { accountId },
      relations: ['tasker', 'tasker.user', 'project'],
      order: { assignedAt: 'DESC' },
    });
  }

  async getAssignmentsForAccountProject(accountId: string, projectId: string) {
    return this.aptRepo.find({
      where: { accountId, projectId },
      relations: ['tasker', 'tasker.user'],
      order: { assignedAt: 'DESC' },
    });
  }

  async getAssignmentsForTasker(taskerId: string) {
    return this.aptRepo.find({
      where: { taskerId, removedAt: IsNull() },
      relations: ['project', 'account'],
      order: { assignedAt: 'DESC' },
    });
  }

  async getAllActiveAssignments(page: number, limit: number) {
    const [data, total] = await this.aptRepo.findAndCount({
      where: { status: 'active', removedAt: IsNull() },
      relations: ['tasker', 'tasker.user', 'project', 'account'],
      order: { assignedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async assertCanLogHours(
    accountId: string,
    projectId: string,
    taskerId: string,
  ) {
    const row = await this.aptRepo.findOne({
      where: { accountId, projectId, taskerId },
    });
    if (!row || row.removedAt) {
      throw new BadRequestException(
        'Tasker is not assigned to this project under this account',
      );
    }
    if (!ACTIVE_STATUSES.includes(row.status)) {
      throw new BadRequestException(
        `Cannot log hours while assignment status is "${row.status}"`,
      );
    }
    const projectLink = await this.paRepo.findOne({
      where: { projectId, accountId },
    });
    if (!projectLink || projectLink.removedAt) {
      throw new BadRequestException('Account is not linked to this project');
    }
  }

  private async assertProjectAndAccount(projectId: string, accountId: string) {
    const project = await this.projectsRepo.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    const account = await this.accountsRepo.findOne({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Account not found');
  }

  /** Keep legacy project.accounts ManyToMany in sync for existing queries. */
  private async syncProjectAccountsRelation(projectId: string) {
    // Do not request a non-decorated 'accounts' relation — it isn't defined on ProjectEntity.
    // Fetch the project normally and update the legacy `accounts` property manually.
    const project = await this.projectsRepo.findOne({
      where: { id: projectId },
    });
    if (!project) return;

    const links = await this.paRepo.find({
      where: { projectId, removedAt: IsNull() },
    });
    const accountIds = links.map((l) => l.accountId);
    const accounts =
      accountIds.length > 0
        ? await this.accountsRepo.findBy({ id: In(accountIds) })
        : [];
    project.accounts = accounts;
    await this.projectsRepo.save(project);
  }

  private async syncProjectTaskersRelation(
    projectId: string,
    taskerId: string,
  ) {
    const project = await this.projectsRepo.findOne({
      where: { id: projectId },
      relations: ['taskers'],
    });
    if (!project) return;
    const tasker = await this.taskersRepo.findOne({ where: { id: taskerId } });
    if (!tasker) return;
    if (!project.taskers?.some((t) => t.id === taskerId)) {
      project.taskers = [...(project.taskers || []), tasker];
      await this.projectsRepo.save(project);
    }
  }
}
