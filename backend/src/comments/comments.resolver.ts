import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from '../users/user.entity';
import { JwtAccessGuard } from 'src/auth/jwt-access.guard';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation(() => Comment)
  @UseGuards(JwtAccessGuard)
  async createComment(
    @Args('postId') postId: string,
    @Args('content') content: string,
    @CurrentUser() user: any,
  ): Promise<Comment> {
    if (!user) {
      throw new Error('User not authenticated');
    }
    return this.commentsService.createComment(postId, content, user.userId);
  }

  @Mutation(() => String)
  @UseGuards(JwtAccessGuard)
  async deleteComment(
    @Args('commentId') commentId: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.commentsService.deleteComment(commentId, user.userId);
  }
}
