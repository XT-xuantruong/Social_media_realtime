import { Resolver, Query, Args } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { PostsListResponse, PostResponse } from './dto/postResponse.dto';

@Resolver()
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => PostResponse)
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
}
