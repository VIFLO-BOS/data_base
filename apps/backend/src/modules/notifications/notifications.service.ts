/**
 * Notifications Service
 * TODO: Implement business logic for notifications.
 */

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

  async findAllForUser(
    userId: string,
    filter: NotificationFilterDto,
    page = 1,
    limit = 20,
  ) {
    const where: any = { userId };
    if (filter.isRead !== undefined) where.isRead = filter.isRead === 'true';
    if (filter.type) where.type = filter.type;

    const [data, total] = await this.notificationsRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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
    const notification = await this.notificationsRepo.findOne({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.notificationsRepo.remove(notification);
    return { message: 'Notification deleted' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationsRepo.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }
}
