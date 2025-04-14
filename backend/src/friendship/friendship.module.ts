import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipResolver } from './friendship.resolver';
import { FriendshipService } from './friendship.service';
import { Friendship } from './friendship.entity';
import { User } from 'src/users/user.entity';
import { LikesService } from 'src/likes/likes.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship, User]), NotificationsModule],
  providers: [FriendshipResolver, FriendshipService],
  exports: [FriendshipService]
})
export class FriendshipModule {}