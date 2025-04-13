import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/posts/posts.entity';
import { Like } from 'src/likes/likes.entity';
import { User } from 'src/users/user.entity';
import { Comment } from 'src/comments/comments.entity';
import { Notification } from './notifications.entity';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Like, Post, Comment, Notification]),
  ],
  providers: [
    NotificationsService,
    NotificationsResolver,
    NotificationsGateway,
    JwtService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
