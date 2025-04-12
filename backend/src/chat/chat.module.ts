import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './chat-rooms.entity';
import { ChatRoomUser } from './chat-room-users.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { User } from 'src/users/user.entity';
import { UsersModule } from 'src/users/users.module';
// import { ChatResolver } from './chat.resolver'; // Nếu dùng GraphQL
import { ChatResolver } from './chat.resolver';
import { Message } from './messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatRoomUser, User, Message]),
    UsersModule
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatResolver],
})
export class ChatModule {}