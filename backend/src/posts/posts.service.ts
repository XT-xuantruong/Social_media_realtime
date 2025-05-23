import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { User } from 'src/users/user.entity';
import { CreatePostDto } from './dto/createPost.dto';
import { Post } from './posts.entity';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostCustom, PostEdge } from './dto/postResponse.dto';
import { PageInfo } from 'src/dto/graphql.response.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private uploadService: UploadService,
  ) {}

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
    currentUserId?: string,
  ): Promise<{
    posts: PostCustom[];
    hasNextPage: boolean;
    endCursor?: string;
    total: number;
    likeCounts: number[];
    commentCounts: number[];
  }> {
    const realLimit = limit + 1;

    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .where('post.visibility IN (:...visibility)', {
        visibility: ['public', 'friends'],
      });

    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('ascii');
        const [createdAtStr, postIdStr] = decoded.split('|');
        const createdAt = new Date(createdAtStr);

        if (isNaN(createdAt.getTime())) throw new Error();

        query.andWhere(
          '(post.created_at < :createdAt OR (post.created_at = :createdAt AND post.post_id < :postIdStr))',
          { createdAt, postIdStr },
        );
      } catch {
        throw new BadRequestException('Invalid cursor format');
      }
    }

    query
      .orderBy('post.created_at', 'DESC')
      .addOrderBy('post.post_id', 'DESC')
      .take(realLimit);

    const fetchedPosts = await query.getMany();
    const hasNextPage = fetchedPosts.length === realLimit;
    const posts = hasNextPage ? fetchedPosts.slice(0, limit) : fetchedPosts;

    const postsWithIsLike = posts.map((post) => {
      const isLike =
        post.likes?.some((like) => like.user?.id === currentUserId) ?? false;
      return { ...post, isLike };
    });

    const endCursor = hasNextPage
      ? Buffer.from(
          `${posts[posts.length - 1].created_at.toISOString()}|${posts[posts.length - 1].post_id}`,
        ).toString('base64')
      : undefined;

    const likeCounts = posts.map((post) => post.likes?.length ?? 0);
    const commentCounts = posts.map((post) => post.comments?.length ?? 0);

    const total = await this.postsRepository.count({
      where: { visibility: 'public' },
    });

    return {
      posts: postsWithIsLike,
      hasNextPage,
      endCursor,
      total,
      likeCounts,
      commentCounts,
    };
  }

  async findMyPosts(
    limit: number,
    cursor?: string,
    currentUserId?: string,
    userId?: string,
  ): Promise<{
    posts: PostCustom[];
    hasNextPage: boolean;
    endCursor?: string;
    total: number;
    likeCounts: number[];
    commentCounts: number[];
  }> {
    if (!currentUserId) {
      throw new BadRequestException('currentUserId is required');
    }

    const realLimit = limit + 1;

    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .where('post.userId = :userId', { userId });

    if (userId !== currentUserId) {
      query.andWhere('post.visibility != :private', { private: 'private' });
    }

    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('ascii');
        const [createdAtStr, postIdStr] = decoded.split('|');
        const createdAt = new Date(createdAtStr);

        if (isNaN(createdAt.getTime())) throw new Error();

        query.andWhere(
          '(post.created_at < :createdAt OR (post.created_at = :createdAt AND post.post_id < :postIdStr))',
          { createdAt, postIdStr },
        );
      } catch {
        throw new BadRequestException('Invalid cursor format');
      }
    }

    query
      .orderBy('post.created_at', 'DESC')
      .addOrderBy('post.post_id', 'DESC')
      .take(realLimit);

    const fetchedPosts = await query.getMany();
    const hasNextPage = fetchedPosts.length === realLimit;
    const posts = hasNextPage ? fetchedPosts.slice(0, limit) : fetchedPosts;

    const postsWithIsLike = posts.map((post) => {
      const isLike =
        post.likes?.some((like) => like.user?.id === currentUserId) ?? false;
      return { ...post, isLike };
    });

    const endCursor = hasNextPage
      ? Buffer.from(
          `${posts[posts.length - 1].created_at.toISOString()}|${
            posts[posts.length - 1].post_id
          }`,
        ).toString('base64')
      : undefined;

    const likeCounts = posts.map((post) => post.likes?.length ?? 0);
    const commentCounts = posts.map((post) => post.comments?.length ?? 0);

    const total = await this.postsRepository.count({
      where: { user: { id: currentUserId } },
    });

    return {
      posts: postsWithIsLike,
      hasNextPage,
      endCursor,
      total,
      likeCounts,
      commentCounts,
    };
  }

  async searchPosts(
    q: string,
    limit: number,
    cursor?: string,
    currentUserId?: string,
  ): Promise<{
    posts: PostCustom[];
    hasNextPage: boolean;
    endCursor?: string;
    total: number;
    likeCounts: number[];
    commentCounts: number[];
  }> {
    const realLimit = limit + 1;

    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .where('LOWER(post.content) LIKE LOWER(:query)', {
        query: `%${q}%`,
      })
      .andWhere('post.visibility IN (:...visibility)', {
        visibility: ['public', 'friends'],
      });

    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('ascii');
        const [createdAtStr, postIdStr] = decoded.split('|');
        const createdAt = new Date(createdAtStr);

        if (isNaN(createdAt.getTime())) throw new Error();

        query.andWhere(
          '(post.created_at < :createdAt OR (post.created_at = :createdAt AND post.post_id < :postIdStr))',
          { createdAt, postIdStr },
        );
      } catch {
        throw new BadRequestException('Invalid cursor format');
      }
    }

    query
      .orderBy('post.created_at', 'DESC')
      .addOrderBy('post.post_id', 'DESC')
      .take(realLimit);

    const fetchedPosts = await query.getMany();
    const hasNextPage = fetchedPosts.length === realLimit;
    const posts = hasNextPage ? fetchedPosts.slice(0, limit) : fetchedPosts;

    const postsWithIsLike = posts.map((post) => {
      const isLike =
        post.likes?.some((like) => like.user?.id === currentUserId) ?? false;
      return { ...post, isLike };
    });

    const endCursor = hasNextPage
      ? Buffer.from(
          `${posts[posts.length - 1].created_at.toISOString()}|${posts[posts.length - 1].post_id}`,
        ).toString('base64')
      : undefined;

    const likeCounts = posts.map((post) => post.likes?.length ?? 0);
    const commentCounts = posts.map((post) => post.comments?.length ?? 0);

    const total = await this.postsRepository.count({
      where: { visibility: 'public' },
    });

    return {
      posts: postsWithIsLike,
      hasNextPage,
      endCursor,
      total,
      likeCounts,
      commentCounts,
    };
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
