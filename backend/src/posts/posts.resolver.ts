import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { PostsListResponse, PostResponse } from './dto/postResponse.dto';
import { LikesService } from 'src/likes/likes.service';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
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
    const { post, total, likeCount, commentCount } =
      await this.postsService.findOne(postId);
    return {
      message: 'Post retrieved successfully',
      status: 200,
      data: post,
      likeCount, // Trả về số lượng like
      commentCount, // Trả về số lượng comment
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
    @Args('limit', { type: () => Int }) limit: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
    @CurrentUser() user?: any,
  ): Promise<PostsListResponse> {
    const { posts, hasNextPage, endCursor, total, likeCounts, commentCounts } =
      await this.postsService.findPosts(limit, cursor, user.userId);

    return {
      message: 'Posts retrieved successfully',
      status: 200,
      edges: posts.map((post, index) => ({
        node: post,
        cursor: Buffer.from(post.created_at.toISOString()).toString('base64'),
        likeCount: likeCounts[index], // Số lượng like cho bài đăng
        commentCount: commentCounts[index], // Số lượng comment cho bài đăng
      })),
      pageInfo: {
        endCursor,
        hasNextPage,
        total,
      },
    };
  }

  @Query(() => PostsListResponse)
  @UseGuards(JwtAccessGuard)
  async getMyPosts(
    @Args('limit', { type: () => Int }) limit: number,
    @Args('userId', { type: () => String }) userId: string,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
    @CurrentUser() userReq?: any,
  ): Promise<PostsListResponse> {
    const { posts, hasNextPage, endCursor, total, likeCounts, commentCounts } =
      await this.postsService.findMyPosts(
        limit,
        cursor,
        userReq.userId,
        userId,
      );

    return {
      message: 'Posts retrieved successfully',
      status: 200,
      edges: posts.map((post, index) => ({
        node: post,
        cursor: Buffer.from(post.created_at.toISOString()).toString('base64'),
        likeCount: likeCounts[index],
        commentCount: commentCounts[index],
      })),
      pageInfo: {
        endCursor,
        hasNextPage,
        total,
      },
    };
  }

  @Query(() => PostsListResponse)
  @UseGuards(JwtAccessGuard)
  async searchPosts(
    @Args('query', { type: () => String }) query: string,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
    @CurrentUser() user?: any,
  ): Promise<PostsListResponse> {
    const { posts, hasNextPage, endCursor, total, likeCounts, commentCounts } =
      await this.postsService.searchPosts(query, limit, cursor, user.userId);

    return {
      message: 'Posts retrieved successfully',
      status: 200,
      edges: posts.map((post, index) => ({
        node: post,
        cursor: Buffer.from(post.created_at.toISOString()).toString('base64'),
        likeCount: likeCounts[index], // Số lượng like cho bài đăng
        commentCount: commentCounts[index], // Số lượng comment cho bài đăng
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
    @CurrentUser() user: any,
  ): Promise<string> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.likesService.likePost(postId, user.userId);
  }

  @Mutation(() => String)
  @UseGuards(JwtAccessGuard)
  async unlikePost(
    @Args('postId') postId: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.likesService.unlikePost(postId, user.userId);
  }
}
