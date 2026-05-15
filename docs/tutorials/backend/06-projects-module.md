# B-06: Build Projects — CRUD, Tasker Assignment, Filtering

> **Goal:** Full CRUD for projects with tasker assignment and status filtering.  
> **Time Estimate:** 1.5 hours  
> **Prerequisites:** [B-05 — Users & Profiles](./05-users-profiles-module.md)

---

## What You'll Build

- `ProjectEntity` with client and tasker relations
- `ProjectsService` — CRUD + assign/unassign taskers
- `ProjectsController` — RESTful endpoints with filters
- DTOs for create, update, and assignment

---

## Step 1: Build Project Entity

**File:** `apps/backend/src/modules/projects/entities/project.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ClientEntity } from '../../clients/entities/client.entity';
import { TaskerEntity } from '../../taskers/entities/tasker.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'draft' })
  status: string; // draft, active, paused, completed, archived

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ClientEntity, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: ClientEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @ManyToMany(() => TaskerEntity)
  @JoinTable({
    name: 'project_taskers',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tasker_id', referencedColumnName: 'id' },
  })
  taskers: TaskerEntity[];
}
```

---

## Step 2: Build Client and Tasker Entities (needed for relations)

**File:** `apps/backend/src/modules/clients/entities/client.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column({ name: 'billing_address', nullable: true })
  billingAddress: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
```

**File:** `apps/backend/src/modules/taskers/entities/tasker.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('taskers')
export class TaskerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column('text', { array: true, nullable: true })
  skills: string[];

  @Column({ name: 'availability_status', default: 'available' })
  availabilityStatus: string;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ nullable: true })
  bio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
```

---

## Step 3: Build Project DTOs

**File:** `apps/backend/src/modules/projects/dto/create-project.dto.ts`

```typescript
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project Alpha' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'A data annotation project' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ description: 'UUID of the client' })
  @IsString()
  @IsOptional()
  clientId?: string;
}
```

**File:** `apps/backend/src/modules/projects/dto/update-project.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ enum: ['draft', 'active', 'paused', 'completed', 'archived'] })
  @IsString()
  @IsOptional()
  @IsIn(['draft', 'active', 'paused', 'completed', 'archived'])
  status?: string;
}
```

---

## Step 4: Build `ProjectsService`

**File:** `apps/backend/src/modules/projects/projects.service.ts`

```typescript
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
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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
```

---

## Step 5: Build `ProjectsController`

**File:** `apps/backend/src/modules/projects/projects.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all projects' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.projectsService.findAll(page || 1, limit || 20, status);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a new project' })
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a project' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Post(':id/taskers/:taskerId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Assign a tasker to a project' })
  assignTasker(@Param('id') id: string, @Param('taskerId') taskerId: string) {
    return this.projectsService.assignTasker(id, taskerId);
  }

  @Delete(':id/taskers/:taskerId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Remove a tasker from a project' })
  removeTasker(@Param('id') id: string, @Param('taskerId') taskerId: string) {
    return this.projectsService.removeTasker(id, taskerId);
  }
}
```

---

## Step 6: Update `ProjectsModule`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectEntity } from './entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, TaskerEntity])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
```

---

## ✅ Checklist

- [ ] `ProjectEntity` with client and tasker relations
- [ ] `ClientEntity` and `TaskerEntity` created
- [ ] `CreateProjectDto` and `UpdateProjectDto` with validation
- [ ] `ProjectsService` — CRUD + assign/remove taskers
- [ ] `ProjectsController` — 7 endpoints (CRUD + assignment)
- [ ] `ProjectsModule` imports entities
- [ ] Test all endpoints via Swagger

---

## What's Next?

→ [**B-07:** Build Taskers — CRUD, Assignment, Performance Metrics](./07-taskers-module.md)
