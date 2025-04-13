// notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/notification',
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    console.log('NotificationsGateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Lấy token từ query hoặc header
      const token =
        client.handshake.auth.token ||
        client.handshake.query.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Xác thực token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      // Kiểm tra tokenType
      if (!payload.tokenType || payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Lưu userId vào socket để sử dụng sau này
      client.data = { userId: payload.sub };

      // Thêm client vào room dựa trên userId
      client.join(payload.sub);
      console.log(`Client connected: ${client.id}, userId: ${payload.sub}`);
    } catch (error) {
      console.error('Connection error:', error.message);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Gửi thông báo tới user cụ thể
  sendNotification(userId: string, notification: any) {
    this.server.to(userId).emit('newNotification', notification);
  }
}
