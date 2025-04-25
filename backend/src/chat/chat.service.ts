import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './chat-rooms.entity';
import { ChatRoomUser } from './chat-room-users.entity';
import { Message } from './messages.entity';
import { CreateChatRoomDto } from './dto/createChatRoom.dto';
import { SendMessageInput } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';
import { MessageEdge } from './dto/response.type';
import { PageInfo } from 'src/dto/graphql.response.dto';
import { PaginatedChatRoomsResponse } from './dto/chatroom.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    public readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomUser)
    public readonly chatRoomUserRepository: Repository<ChatRoomUser>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly usersService: UsersService,
  ) {}

  async createChatRoom(
    dto: CreateChatRoomDto,
    currentUserId: string,
  ): Promise<ChatRoom> {
    await this.validateRoomCreation(dto, currentUserId);
    await this.checkExistingRoom(dto, currentUserId);
    const room = await this.createAndSaveRoom(dto);
    await this.addUsersToRoom(room, currentUserId, dto.user_ids);
    return room;
  }

  private async validateRoomCreation(
    dto: CreateChatRoomDto,
    currentUserId: string,
  ): Promise<void> {
    const uniqueUserIds = [...new Set([currentUserId, ...dto.user_ids])];
    await this.usersService.findManyByIds(uniqueUserIds);
    if (!dto.is_group && uniqueUserIds.length !== 2) {
      throw new BadRequestException(
        'Direct chat must include exactly one other user',
      );
    }
    if (dto.is_group) {
      if (!dto.name?.trim()) {
        throw new BadRequestException('Group chat must have a name');
      }
      if (uniqueUserIds.length < 3) {
        throw new BadRequestException(
          'Group chat must include at least two other users',
        );
      }
    }
  }

  private async checkExistingRoom(
    dto: CreateChatRoomDto,
    currentUserId: string,
  ): Promise<void> {
    const uniqueUserIds = [...new Set([currentUserId, ...dto.user_ids])].sort();
    const userCount = uniqueUserIds.length;

    const rooms = await this.chatRoomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomUsers', 'roomUsers')
      .leftJoinAndSelect('roomUsers.user', 'user')
      .where('user.id IN (:...userIds)', { userIds: uniqueUserIds })
      .getMany();

    for (const room of rooms) {
      const roomUserIds = room.roomUsers.map((ru) => ru.user.id).sort();
      if (
        roomUserIds.length === userCount &&
        roomUserIds.every((id, index) => id === uniqueUserIds[index])
      ) {
        if (dto.is_group && room.is_group && room.name === dto.name?.trim()) {
          throw new BadRequestException(
            'Group chat with this name and users already exists',
          );
        }
        if (!dto.is_group && !room.is_group) {
          throw new BadRequestException(
            'Direct chat with these users already exists',
          );
        }
      }
    }
  }

  private async createAndSaveRoom(dto: CreateChatRoomDto): Promise<ChatRoom> {
    const roomData = {
      is_group: dto.is_group,
      name: dto.name?.trim(),
    };
    const room = this.chatRoomRepository.create(roomData as ChatRoom);
    return this.chatRoomRepository.save(room);
  }

  private async addUsersToRoom(
    room: ChatRoom,
    currentUserId: string,
    userIds: string[],
  ): Promise<void> {
    const uniqueUserIds = [...new Set([currentUserId, ...userIds])];
    const users = await this.usersService.findManyByIds(uniqueUserIds);

    await Promise.all(
      users.map(async (user) => {
        const roomUser = this.chatRoomUserRepository.create({ room, user });
        await this.chatRoomUserRepository.save(roomUser);
      }),
    );
  }

  async sendMessage(
    input: SendMessageInput,
    senderId: string,
  ): Promise<Message> {
    const room = await this.chatRoomRepository.findOne({
      where: { room_id: input.room_id },
      relations: ['roomUsers', 'roomUsers.user'],
    });
    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    const isMember = room.roomUsers.some((ru) => ru.user.id === senderId);
    if (!isMember) {
      throw new BadRequestException('You are not a member of this room');
    }

    const sender = await this.usersService.findById(senderId);

    if (!input.content.trim() && input.content !== '') {
      throw new BadRequestException('Message content cannot be empty');
    }

    const message = this.messageRepository.create({
      content: input.content.trim(),
      room,
      sender,
    });
    const savedMessage = await this.messageRepository.save(message);

    // Tải lại message với đầy đủ quan hệ
    return this.messageRepository.findOne({
      where: { message_id: savedMessage.message_id },
      relations: ['sender', 'room'],
    });
  }

  async getMessages(
    roomId: string,
    userId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ edges: MessageEdge[]; pageInfo: PageInfo }> {
    const room = await this.chatRoomRepository.findOne({
      where: { room_id: roomId },
      relations: ['roomUsers', 'roomUsers.user'],
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    if (!room.roomUsers.some((ru) => ru.user.id === userId)) {
      throw new BadRequestException('You are not a member of this room');
    }

    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.room', 'room')
      .where('message.roomRoomId = :roomId', { roomId })
      .orderBy('message.created_at', 'DESC')
      .take(limit + 1);

    if (cursor) {
      try {
        const cursorDate = new Date(
          Buffer.from(cursor, 'base64').toString('ascii'),
        );
        query.andWhere('message.created_at < :cursor', { cursor: cursorDate });
      } catch (error) {
        throw new BadRequestException('Invalid cursor format');
      }
    }

    const messages = await query.getMany();

    const total = await this.messageRepository.count({
      where: { room: { room_id: roomId } },
    });

    const hasNextPage = messages.length > limit;
    const messagesToReturn = messages.slice(0, limit);

    const edges = messagesToReturn.map((message) => ({
      node: message,
      cursor: Buffer.from(message.created_at.toISOString()).toString('base64'),
    }));

    return {
      edges,
      pageInfo: {
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasNextPage,
        total,
      },
    };
  }

  async getChatRooms(
    userId: string,
    limit: number = 10,
    cursor?: string,
  ): Promise<PaginatedChatRoomsResponse> {
    // Truy vấn lấy tất cả room mà userId tham gia
    const query = this.chatRoomRepository
      .createQueryBuilder('room')
      .leftJoin('room.roomUsers', 'roomUsersCheck') // Join để kiểm tra userId tồn tại
      .leftJoin('roomUsersCheck.user', 'userCheck')
      .where('userCheck.id = :userId', { userId })
      .leftJoinAndSelect('room.roomUsers', 'roomUsers') // Lấy tất cả roomUsers
      .leftJoinAndSelect('roomUsers.user', 'user') // Lấy thông tin user
      .leftJoinAndSelect('room.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .orderBy('room.created_at', 'DESC')
      .take(limit + 1);

    if (cursor) {
      try {
        const cursorDate = new Date(
          Buffer.from(cursor, 'base64').toString('ascii'),
        );
        query.andWhere('room.created_at < :cursor', { cursor: cursorDate });
      } catch (error) {
        throw new BadRequestException('Invalid cursor format');
      }
    }

    const rooms = await query.getMany();

    // Xử lý room để chỉ giữ user còn lại (khác với userId)
    const roomsWithOtherUser = rooms.map((room) => {
      const otherUser = room.roomUsers.find(
        (roomUser) => roomUser.user.id !== userId,
      );
      return {
        ...room,
        roomUsers: otherUser ? [otherUser] : [], // Chỉ trả về user còn lại
      };
    });

    // Đếm tổng số room
    const total = await this.chatRoomRepository
      .createQueryBuilder('room')
      .leftJoin('room.roomUsers', 'roomUsers')
      .leftJoin('roomUsers.user', 'user')
      .where('user.id = :userId', { userId })
      .getCount();

    const hasNextPage = rooms.length > limit;
    const roomsToReturn = roomsWithOtherUser.slice(0, limit);

    const edges = roomsToReturn.map((room) => ({
      node: room,
      cursor: Buffer.from(room.created_at.toISOString()).toString('base64'),
    }));

    return {
      edges,
      pageInfo: {
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasNextPage,
        total,
      },
    };
  }
}
