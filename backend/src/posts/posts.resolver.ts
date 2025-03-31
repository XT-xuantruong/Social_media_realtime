import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { PostsListResponse, PostResponse } from './dto/postResponse.dto';
import { LikesService } from 'src/likes/likes.service';
import { Req, UseGuards } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { CurrentUser } from 'src/current-user/current-user.decorator';
import { JwtAccessGuard } from 'src/auth/jwt-access.guard';

@Resolver()
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
  ) {}

  @Query(() => PostResponse)
  @UseGuards(JwtAccessGuard)
  async getPost(@Args('postId') postId: string): Promise<PostResponse> {
    const { post, total } = await this.postsService.findOne(postId);
    return {
      message: 'Post retrieved successfully',
      status: 200,
      data: post,
      pagination: {
        endCursor: null,
        hasNextPage: false,
        total,
      },
    };
  }

  @Query(() => PostsListResponse)
  @UseGuards(JwtAccessGuard)
  async getPosts(
    @Args('limit', { type: () => Number }) limit: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ): Promise<PostsListResponse> {
    const { posts, hasNextPage, endCursor, total } =
      await this.postsService.findPosts(limit, cursor);

    return {
      message: 'Posts retrieved successfully',
      status: 200,
      edges: posts.map((post) => ({
        node: post,
        cursor: Buffer.from(post.created_at.toISOString()).toString('base64'),
      })),
      pageInfo: {
        endCursor,
        hasNextPage,
        total,
      },
    };
  }

  @Mutation(() => String)
  @UseGuards(JwtAccessGuard)
  async likePost(
    @Args('postId') postId: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.likesService.likePost(postId, user.id);
  }

  @Mutation(() => String)
  @UseGuards(JwtAccessGuard)
  async unlikePost(
    @Args('postId') postId: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.likesService.unlikePost(postId, user.id);
  }
}
