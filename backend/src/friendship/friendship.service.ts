import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { User } from 'src/users/user.entity';
import { PaginatedUserResponse, PaginatedFriendshipResponse } from './dto/paginated-response.dto';
import { UserType } from 'src/users/user.type';
import { plainToClass } from 'class-transformer';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getFriends(limit: number, offset: number, currentUserId: string): Promise<PaginatedUserResponse> {
    const [items, total] = await this.friendshipRepository.findAndCount({
      where: { user: { id: currentUserId }, status: 'accepted' },
      take: limit,
      skip: offset,
      relations: ['friend'],
    });

    const mappedItems = plainToClass(
      UserType,
      items.map((f) => f.friend),
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

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }
    if (!friend) {
      throw new NotFoundException('Friend not found');
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { user: { id: currentUserId }, friend: { id: friendId } },
        { user: { id: friendId }, friend: { id: currentUserId } },
      ],
    });

    if (existingFriendship) {
      throw new BadRequestException('A friendship request already exists between these users');
    }

    if (currentUserId === friendId) {
      throw new BadRequestException('You cannot send a friend request to yourself');
    }

    const friendship = this.friendshipRepository.create({
      user: currentUser,
      friend: friend,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return this.friendshipRepository.save(friendship);
  }
}