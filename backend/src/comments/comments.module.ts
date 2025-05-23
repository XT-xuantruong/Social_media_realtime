import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { CommentsService } from './comments.service';
import { User } from 'src/users/user.entity';
import { Like } from 'src/likes/likes.entity';
import { Post } from 'src/posts/posts.entity';
import { CommentsResolver } from './comments.resolver';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Like, Post, Comment]),
    NotificationsModule,
  ],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}
