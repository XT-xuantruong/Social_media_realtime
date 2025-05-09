import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './likes.entity';
import { Post } from '../posts/posts.entity';
import { User } from 'src/users/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Like]), NotificationsModule],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
