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
import { Message } from './messages.entity';

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

  afterInit() {
    console.log('ChatGateway initialized');
  }

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

      if (!payload.tokenType || payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      client.data = { userId: payload.sub };
      console.log(`Client connected: ${client.id} with userId: ${payload.sub}`);
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() input: SendMessageInput,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const userId = client.data.userId;
      const message = await this.chatService.sendMessage(input, userId);
      this.server.to(input.room_id).emit('newMessage', message);
      console.log(`Emitted newMessage to room ${input.room_id}:`, message);
    } catch (error) {
      console.error('Error in handleSendMessage:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  // Thêm phương thức để resolver gọi và phát sự kiện newMessage
  emitNewMessage(roomId: string, message: Message): void {
    this.server.to(roomId).emit('newMessage', message);
    console.log(`Emitted newMessage to room ${roomId} from resolver:`, message);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { room_id: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.data.userId;
    try {
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
      console.log(`Client ${client.id} joined room: ${data.room_id}`);
      client.emit('joinedRoom', { room_id: data.room_id });
    } catch (error) {
      console.error('Error in handleJoinRoom:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { room_id: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(data.room_id);
    console.log(`Client ${client.id} left room: ${data.room_id}`);
    client.emit('leftRoom', { room_id: data.room_id });
  }
}
