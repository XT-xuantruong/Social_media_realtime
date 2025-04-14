import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { User } from 'src/users/user.entity';
import { PaginatedUserResponse, PaginatedFriendshipResponse } from './dto/paginated-response.dto';
import { UserType } from 'src/users/user.type';
import { classToPlain, plainToClass } from 'class-transformer';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,

  ) {}

  async getFriends(limit: number, offset: number, currentUserId: string): Promise<PaginatedUserResponse> {
    const [items, total] = await this.friendshipRepository.findAndCount({
      where: [{user: { id: currentUserId }}, { friend :{id: currentUserId}}],
      take: limit,
      skip: offset,
      relations: ['user', 'friend'],
    });
    console.log(items);
    

    const plainFriends = items.map((f) => {
      const plainFriend = classToPlain(f.friend);
      return {
        ...plainFriend,
        friend_status: f.status, 
        friendshipId: f.friendshipId,
        friendId: f.user.id
      };
    });

  const mappedItems = plainToClass(
    UserType,
    plainFriends,
    { excludeExtraneousValues: true },
  );

      return {
        items: mappedItems,
        total,
      };
    }

  async getFriendRequests(limit: number, offset: number, currentUserId: string): Promise<PaginatedFriendshipResponse> {
    const [items, total] = await this.friendshipRepository.findAndCount({
      where: { friend: { id: currentUserId }, status: 'pending' },
      take: limit,
      skip: offset,
      relations: ['user', 'friend'],
    });

    return { items, total };
  }

  async sendFriendRequest(friendId: string, currentUserId: string): Promise<Friendship> {
    const currentUser = await this.userRepository.findOne({ where: { id: currentUserId } });
    const friend = await this.userRepository.findOne({ where: { id: friendId } });

    const friendship = this.friendshipRepository.create({
      user: currentUser,
      friend: friend,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    await this.notificationsService.createNotification(currentUserId,  'friend_request', friendId);
    
    return this.friendshipRepository.save(friendship);
  }

  async acceptFriendRequest(friendshipId: string, currentUserId: string): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findOne({
      where: { friendshipId },
      relations: ['user', 'friend'],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship request not found');
    }

    if (friendship.friend.id !== currentUserId) {
      throw new UnauthorizedException('You are not authorized to accept this friend request');
    }

    if (friendship.status !== 'pending') {
      throw new BadRequestException('This friend request cannot be accepted');
    }

    friendship.status = 'accepted';
    return this.friendshipRepository.save(friendship);
  }

  async rejectFriendRequest(friendshipId: string, currentUserId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({
      where: { friendshipId },
      relations: ['user', 'friend'],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship request not found');
    }

    if (friendship.friend.id !== currentUserId) {
      throw new UnauthorizedException('You are not authorized to reject this friend request');
    }

    if (friendship.status !== 'pending') {
      throw new BadRequestException('This friend request cannot be rejected');
    }

    await this.friendshipRepository.remove(friendship);
  }

  async removeFriend(friendshipId: string, currentUserId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({
      where: { friendshipId },
      relations: ['user', 'friend'],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    if (friendship.user.id !== currentUserId && friendship.friend.id !== currentUserId) {
      throw new UnauthorizedException('You are not authorized to remove this friendship');
    }

    if (friendship.status !== 'accepted') {
      throw new BadRequestException('This relationship is not an accepted friendship');
    }

    await this.friendshipRepository.remove(friendship);
  }
}