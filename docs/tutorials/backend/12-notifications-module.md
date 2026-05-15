# B-12: Build Notifications — In-App Notification System

> **Goal:** Build an in-app notification system to alert users about events.  
> **Time Estimate:** 45 minutes  
> **Prerequisites:** [B-11 — Analytics Module](./11-analytics-module.md)

---

## What You'll Build

- `NotificationEntity` — Stores notification records per user
- `NotificationsService` — Create, list, mark-read, and delete notifications
- `NotificationsController` — RESTful endpoints for notification management
- Filtering by read/unread status

---

## Step 1: Notification Entity

**File:** `apps/backend/src/modules/notifications/entities/notification.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  message: string;

  @Column({ default: 'info' })
  type: string; // info, warning, success, error

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date;

  @Column({ nullable: true })
  link: string; // Optional deep-link to a resource

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
```

---

## Step 2: DTOs

**File:** `apps/backend/src/modules/notifications/dto/create-notification.dto.ts`

```typescript
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to notify' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'New project assigned' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'You have been assigned to Project Alpha.' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'success', 'error'] })
  @IsOptional()
  @IsIn(['info', 'warning', 'success', 'error'])
  type?: string;

  @ApiPropertyOptional({ example: '/projects/abc-123' })
  @IsString()
  @IsOptional()
  link?: string;
}
```

**File:** `apps/backend/src/modules/notifications/dto/mark-read.dto.ts`

```typescript
import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({ description: 'Array of notification IDs to mark as read' })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
```

**File:** `apps/backend/src/modules/notifications/dto/notification-filter.dto.ts`

```typescript
import { IsOptional, IsIn, IsBooleanString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationFilterDto {
  @ApiPropertyOptional({ enum: ['true', 'false'] })
  @IsOptional()
  @IsBooleanString()
  isRead?: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'success', 'error'] })
  @IsOptional()
  @IsIn(['info', 'warning', 'success', 'error'])
  type?: string;
}
```

---

## Step 3: `NotificationsService`

**File:** `apps/backend/src/modules/notifications/notifications.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationsRepo: Repository<NotificationEntity>,
  ) {}

  async findAllForUser(userId: string, filter: NotificationFilterDto, page = 1, limit = 20) {
    const where: any = { userId };
    if (filter.isRead !== undefined) where.isRead = filter.isRead === 'true';
    if (filter.type) where.type = filter.type;

    const [data, total] = await this.notificationsRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateNotificationDto) {
    const notification = this.notificationsRepo.create(dto);
    return this.notificationsRepo.save(notification);
  }

  async markAsRead(ids: string[], userId: string) {
    await this.notificationsRepo.update(
      { id: In(ids), userId },
      { isRead: true, readAt: new Date() },
    );
    return { message: `${ids.length} notification(s) marked as read` };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { message: 'All notifications marked as read' };
  }

  async delete(id: string, userId: string) {
    const notification = await this.notificationsRepo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.notificationsRepo.remove(notification);
    return { message: 'Notification deleted' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationsRepo.count({ where: { userId, isRead: false } });
    return { unreadCount: count };
  }
}
```

---

## Step 4: `NotificationsController`

**File:** `apps/backend/src/modules/notifications/notifications.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  findAll(
    @Request() req: any,
    @Query() filter: NotificationFilterDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.findAllForUser(req.user.id, filter, page || 1, limit || 20);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  unreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a notification (admin)' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Patch('mark-read')
  @ApiOperation({ summary: 'Mark specific notifications as read' })
  markRead(@Body() dto: MarkReadDto, @Request() req: any) {
    return this.notificationsService.markAsRead(dto.ids, req.user.id);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.delete(id, req.user.id);
  }
}
```

---

## Step 5: Update `NotificationsModule`

**File:** `apps/backend/src/modules/notifications/notifications.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationEntity } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

---

## ✅ Checklist

- [ ] `NotificationEntity` with user relation
- [ ] `CreateNotificationDto`, `MarkReadDto`, `NotificationFilterDto`
- [ ] `NotificationsService` — create, list, mark-read, delete, unread count
- [ ] `NotificationsController` — 6 endpoints
- [ ] Module updated, test via Swagger

→ [**B-13:** Build Audit Logs](./13-audit-logs-module.md)
