# B-07: Build Taskers — CRUD, Assignment, Performance Metrics

> **Goal:** Full CRUD for tasker management.  
> **Time Estimate:** 1 hour  
> **Prerequisites:** [B-06 — Projects Module](./06-projects-module.md)

---

## What You'll Build

- `TaskersService` — CRUD + performance stats
- `TaskersController` — RESTful endpoints
- DTOs for create and update

---

## Step 1: Tasker DTOs

**File:** `apps/backend/src/modules/taskers/dto/create-tasker.dto.ts`

```typescript
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskerDto {
  @ApiProperty({ description: 'User ID to link this tasker profile to' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: ['data-labeling', 'image-annotation'] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ example: 25.00 })
  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 'Experienced data annotator...' })
  @IsString()
  @IsOptional()
  bio?: string;
}
```

**File:** `apps/backend/src/modules/taskers/dto/update-tasker.dto.ts`

```typescript
import { IsString, IsOptional, IsNumber, IsArray, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskerDto {
  @ApiPropertyOptional()
  @IsArray() @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ enum: ['available', 'assigned', 'unavailable'] })
  @IsString() @IsOptional()
  @IsIn(['available', 'assigned', 'unavailable'])
  availabilityStatus?: string;

  @ApiPropertyOptional()
  @IsNumber() @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  bio?: string;
}
```

---

## Step 2: Build `TaskersService`

**File:** `apps/backend/src/modules/taskers/taskers.service.ts`

```typescript
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
    const qb = this.taskersRepo.createQueryBuilder('tasker')
      .leftJoinAndSelect('tasker.user', 'user')
      .orderBy('tasker.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.where('tasker.availability_status = :status', { status });
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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
```

---

## Step 3: Build `TaskersController`

**File:** `apps/backend/src/modules/taskers/taskers.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TaskersService } from './taskers.service';
import { CreateTaskerDto } from './dto/create-tasker.dto';
import { UpdateTaskerDto } from './dto/update-tasker.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Taskers')
@ApiBearerAuth()
@Controller('taskers')
export class TaskersController {
  constructor(private readonly taskersService: TaskersService) {}

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all taskers' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.taskersService.findAll(page || 1, limit || 20, status);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get tasker by ID' })
  findOne(@Param('id') id: string) { return this.taskersService.findById(id); }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create tasker profile' })
  create(@Body() dto: CreateTaskerDto) { return this.taskersService.create(dto); }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update tasker' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskerDto) {
    return this.taskersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete tasker' })
  remove(@Param('id') id: string) { return this.taskersService.delete(id); }
}
```

---

## Step 4: Update `TaskersModule`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskersController } from './taskers.controller';
import { TaskersService } from './taskers.service';
import { TaskerEntity } from './entities/tasker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskerEntity])],
  controllers: [TaskersController],
  providers: [TaskersService],
  exports: [TaskersService, TypeOrmModule],
})
export class TaskersModule {}
```

---

## ✅ Checklist

- [ ] `CreateTaskerDto` and `UpdateTaskerDto`
- [ ] `TaskersService` — full CRUD with pagination
- [ ] `TaskersController` — 5 endpoints
- [ ] Module updated, test via Swagger

→ [**B-08:** Build Accounts](./08-accounts-module.md)
