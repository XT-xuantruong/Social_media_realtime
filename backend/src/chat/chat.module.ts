import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './chat-rooms.entity';
import { ChatRoomUser } from './chat-room-users.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { User } from 'src/users/user.entity';
import { UsersModule } from 'src/users/users.module';
// import { ChatResolver } from './chat.resolver'; // Nếu dùng GraphQL

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatRoomUser, User]),
    UsersModule
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}