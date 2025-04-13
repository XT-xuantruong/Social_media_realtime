import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SendMessageInput } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/chat',
})
@Injectable()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  // Xử lý khi client kết nối
  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth.token?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      // Kiểm tra tokenType
      if (!payload.tokenType || payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Lưu userId vào socket để sử dụng sau này
      client.data = { userId: payload.sub };
      console.log(`Client connected: ${client.id} with userId: ${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  // Xử lý khi client ngắt kết nối
  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Xử lý sự kiện gửi tin nhắn
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() input: SendMessageInput,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const userId = client.data.userId;
      const message = await this.chatService.sendMessage(input, userId);

      // Phát tin nhắn đến tất cả client trong phòng
      this.server.to(input.room_id).emit('newMessage', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Tham gia phòng chat
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { room_id: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.data.userId;
    try {
      // Kiểm tra xem user có trong phòng không
      const room = await this.chatService.chatRoomRepository.findOne({
        where: { room_id: data.room_id },
        relations: ['roomUsers', 'roomUsers.user'],
      });

      if (!room) {
        throw new Error('Chat room not found');
      }

      const isMember = room.roomUsers.some((ru) => ru.user.id === userId);
      if (!isMember) {
        throw new Error('You are not a member of this room');
      }

      client.join(data.room_id);
      client.emit('joinedRoom', { room_id: data.room_id });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Rời phòng chat
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { room_id: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(data.room_id);
    client.emit('leftRoom', { room_id: data.room_id });
  }
}
