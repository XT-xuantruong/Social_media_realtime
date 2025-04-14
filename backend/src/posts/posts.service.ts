import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { User } from 'src/users/user.entity';
import { CreatePostDto } from './dto/createPost.dto';
import { Post } from './posts.entity';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostEdge } from './dto/postResponse.dto';
import { PageInfo } from 'src/dto/graphql.response.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private uploadService: UploadService,
  ) { }

  async findOne(post_id: string): Promise<{
    post: Post;
    total: number;
    likeCount: number;
    commentCount: number;
  }> {
    const post = await this.postsRepository.findOneOrFail({
      where: { post_id },
      relations: ['user', 'likes', 'comments', 'comments.user'],
    });
    const total = await this.postsRepository.count();
    const likeCount = post.likes ? post.likes.length : 0;
    const commentCount = post.comments ? post.comments.length : 0;
    return { post, total, likeCount, commentCount };
  }

  async findPosts(
    limit: number,
    cursor?: string,
  ): Promise<{
    posts: Post[];
    hasNextPage: boolean;
    endCursor?: string;
    total: number;
    likeCounts: number[];
    commentCounts: number[];
  }> {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .orderBy('post.created_at', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('ascii');
      query.where('post.created_at < :cursor', { cursor: decodedCursor });
    }

    const posts = await query.getMany();
    const total = await this.postsRepository.count();
    const hasNextPage = posts.length > limit;
    const endCursor = hasNextPage
      ? Buffer.from(posts[limit - 1].created_at.toISOString()).toString('base64')
      : undefined;

    const likeCounts = posts.map((post) => (post.likes ? post.likes.length : 0));
    const commentCounts = posts.map((post) =>
      post.comments ? post.comments.length : 0,
    );

    return {
      posts: posts.slice(0, limit),
      hasNextPage,
      endCursor,
      total,
      likeCounts,
      commentCounts,
    };
  }

  async searchPosts(
    query: string,
    limit: number = 10,
    cursor?: string,
  ): Promise<{ edges: PostEdge[]; pageInfo: PageInfo }> {
    try {
      if (!query.trim()) {
        throw new BadRequestException('Query không được rỗng');
      }
      if (limit <= 0) {
        throw new BadRequestException('Limit phải lớn hơn 0');
      }

      const queryBuilder = this.postsRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.likes', 'likes')
        .leftJoinAndSelect('post.comments', 'comments')
        .where('LOWER(post.content) LIKE LOWER(:query)', { query: `%${query}%` })
        .orderBy('post.created_at', 'DESC')
        .take(limit + 1);

      if (cursor) {
        try {
          const cursorDate = new Date(Buffer.from(cursor, 'base64').toString('ascii'));
          queryBuilder.andWhere('post.created_at < :cursor', { cursor: cursorDate });
        } catch (error) {
          throw new BadRequestException('Invalid cursor format');
        }
      }

      const posts = await queryBuilder.getMany();
      const total = await this.postsRepository.count({
        where: { content: Like(`%${query}%`) }, // Sử dụng Like từ TypeORM
      });

      const hasNextPage = posts.length > limit;
      const postsToReturn = posts.slice(0, limit);

      const edges = postsToReturn.map((post) => ({
        node: post,
        cursor: Buffer.from(post.created_at.toISOString()).toString('base64'),
        likeCount: post.likes ? post.likes.length : 0,
        commentCount: post.comments ? post.comments.length : 0,
      }));

      return {
        edges,
        pageInfo: {
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          hasNextPage,
          total,
        },
      };
    } catch (error) {
      throw new Error(`Không thể tìm kiếm bài đăng: ${error.message}`);
    }
  }
  async create(
    postData: CreatePostDto,
    files: Express.Multer.File[],
    user_id: string,
  ): Promise<Post> {
    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let mediaUrls: string[] = [];
    if (files && files.length > 0) {
      mediaUrls = await Promise.all(
        files.map((file) => this.uploadService.uploadImage(file, 'Post')),
      );
    }

    const post = this.postsRepository.create({
      content: postData.content,
      media_url: mediaUrls.length > 0 ? mediaUrls : null,
      visibility: postData.visibility,
      user: user,
    });

    return this.postsRepository.save(post);
  }

  async update(
    postId: string,
    postData: UpdatePostDto,
    files: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ post_id: postId });
    if (!post) {
      throw new NotFoundException(
        'Post not found or you do not have permission to update it',
      );
    }

    if (postData.content !== undefined) {
      post.content = postData.content;
    }

    if (files && files.length > 0) {
      const newMediaUrls = await Promise.all(
        files.map((file) => this.uploadService.uploadImage(file, 'Post')),
      );
      post.media_url = post.media_url
        ? [...post.media_url, ...newMediaUrls]
        : newMediaUrls;
    }

    if (postData.visibility !== undefined) {
      post.visibility = postData.visibility;
    }

    return this.postsRepository.save(post);
  }

  async delete(postId: string): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { post_id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postsRepository.delete(postId);
  }
}

function TypeOrmLike(arg0: string): string | import("typeorm").FindOperator<string> {
  throw new Error('Function not implemented.');
}
