import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { NotificationsService } from './notifications.service';
import { NotificationResponse } from './dto/notificationResponse.dto';
import { Notification } from './notifications.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from 'src/auth/jwt-access.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/user.entity';

@Resolver()
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => NotificationResponse)
  @UseGuards(JwtAccessGuard)
  async getNotifications(
    @CurrentUser() user: User,
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ): Promise<NotificationResponse> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { notifications, hasNextPage, endCursor, total } =
      await this.notificationsService.getNotifications(user.id, limit, cursor);

    return {
      message: 'Notifications retrieved successfully',
      status: 200,
      data: {
        edges: notifications.map((notification) => ({
          node: notification,
          cursor: Buffer.from(notification.created_at.toISOString()).toString(
            'base64',
          ),
        })),
        pageInfo: {
          endCursor,
          hasNextPage,
          total,
        },
      },
    };
  }

  @Mutation(() => Notification)
  @UseGuards(JwtAccessGuard)
  async markNotificationAsRead(
    @Args('notificationId') notificationId: string,
    @CurrentUser() user: any,
  ): Promise<Notification> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.notificationsService.markAsRead(notificationId, user.userId);
  }
}
