import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification } from './notifications.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async getNotifications(
    userId: string,
    limit: number,
    cursor?: string,
  ): Promise<{
    notifications: Notification[];
    hasNextPage: boolean;
    endCursor?: string;
    total: number;
  }> {
    const queryOptions: any = {
      where: { user: { id: userId } },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit + 1, // Lấy thêm 1 để kiểm tra hasNextPage
    };

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('ascii');
      queryOptions.where.created_at = LessThan(decodedCursor);
    }

    const notifications = await this.notificationsRepository.find(queryOptions);
    const total = await this.notificationsRepository.count({
      where: { user: { id: userId } },
    });

    const hasNextPage = notifications.length > limit;
    const endCursor = hasNextPage
      ? Buffer.from(notifications[limit - 1].created_at.toISOString()).toString(
          'base64',
        )
      : undefined;

    return {
      notifications: notifications.slice(0, limit),
      hasNextPage,
      endCursor,
      total,
    };
  }
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { notification_id: notificationId, user: { id: userId } },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found or you do not have permission to update it',
      );
    }

    notification.is_read = true;
    return this.notificationsRepository.save(notification);
  }
}
