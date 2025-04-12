// src/chat/chat.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './chat-rooms.entity';
import { ChatRoomUser } from './chat-room-users.entity';
import { CreateChatRoomDto } from './dto/createChatRoom.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomUser)
    private readonly chatRoomUserRepository: Repository<ChatRoomUser>,
    private readonly usersService: UsersService,
  ) {}

  async createChatRoom(dto: CreateChatRoomDto, currentUserId: string): Promise<ChatRoom> {
    await this.validateRoomCreation(dto, currentUserId);
    await this.checkExistingRoom(dto, currentUserId);
    const room = await this.createAndSaveRoom(dto);
    await this.addUsersToRoom(room, currentUserId, dto.user_ids);
    return room;
  }

  private async validateRoomCreation(dto: CreateChatRoomDto, currentUserId: string): Promise<void> {
    const uniqueUserIds = [...new Set([currentUserId, ...dto.user_ids])];
    await this.usersService.findManyByIds(uniqueUserIds);
    if (!dto.is_group && uniqueUserIds.length !== 2) {
      throw new BadRequestException('Direct chat must include exactly one other user');
    }
    if (dto.is_group) {
      if (!dto.name?.trim()) {
        throw new BadRequestException('Group chat must have a name');
      }
      if (uniqueUserIds.length < 3) {
        throw new BadRequestException('Group chat must include at least two other users');
      }
    }
  }

  private async checkExistingRoom(dto: CreateChatRoomDto, currentUserId: string): Promise<void> {
    const uniqueUserIds = [...new Set([currentUserId, ...dto.user_ids])].sort();
    const userCount = uniqueUserIds.length;

    const rooms = await this.chatRoomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomUsers', 'roomUsers')
      .leftJoinAndSelect('roomUsers.user', 'user')
      .where('user.id IN (:...userIds)', { userIds: uniqueUserIds })
      .getMany();

    for (const room of rooms) {
      const roomUserIds = room.roomUsers
        .map((ru) => ru.user.id)
        .sort();

      if (
        roomUserIds.length === userCount &&
        roomUserIds.every((id, index) => id === uniqueUserIds[index])
      ) {
        if (dto.is_group && room.is_group && room.name === dto.name?.trim()) {
          throw new BadRequestException('Group chat with this name and users already exists');
        }
        if (!dto.is_group && !room.is_group) {
          throw new BadRequestException('Direct chat with these users already exists');
        }
      }
    }
  }

  private async createAndSaveRoom(dto: CreateChatRoomDto): Promise<ChatRoom> {
    const room = this.chatRoomRepository.create({
      is_group: dto.is_group ? 1 : 0, // Chuyển boolean thành 0/1
      name: dto.name?.trim(),
    });
    return this.chatRoomRepository.save(room);
  }

  private async addUsersToRoom(room: ChatRoom, currentUserId: string, userIds: string[]): Promise<void> {
    const uniqueUserIds = [...new Set([currentUserId, ...userIds])];
    const users = await this.usersService.findManyByIds(uniqueUserIds);

    await Promise.all(
      users.map(async (user) => {
        const roomUser = this.chatRoomUserRepository.create({ room, user });
        await this.chatRoomUserRepository.save(roomUser);
      }),
    );
  }
}