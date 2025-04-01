import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Post } from './posts.entity';
import { UploadModule } from 'src/upload/upload.module';
import { PostsResolver } from './posts.resolver';
import { Like } from 'src/likes/likes.entity';
import { Comment } from 'src/comments/comments.entity';
import { LikesModule } from 'src/likes/likes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Like, Comment]),
    UploadModule,
    LikesModule,
  ],
  providers: [PostsService, PostsResolver],
  controllers: [PostsController],
})
export class PostsModule {}
