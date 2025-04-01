import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadService } from 'src/upload/upload.service';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/createPost.dto';
import { Post } from './posts.entity';
import { UpdatePostDto } from './dto/updatePost.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private uploadService: UploadService,
  ) {}

  async findOne(post_id: string): Promise<{ post: Post; total: number }> {
    const post = await this.postsRepository.findOneOrFail({
      where: { post_id },
      relations: ['user', 'likes', 'comments'],
    });
    const total = await this.postsRepository.count();
    return { post, total };
  }

  async findPosts(
    limit: number,
    cursor?: string,
  ): Promise<{
    posts: Post[];
    hasNextPage: boolean;
    endCursor?: string;
    total: number;
  }> {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
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
      ? Buffer.from(posts[limit - 1].created_at.toISOString()).toString(
          'base64',
        )
      : undefined;

    return {
      posts: posts.slice(0, limit),
      hasNextPage,
      endCursor,
      total,
    };
  }

  async create(
    postData: CreatePostDto,
    file: Express.Multer.File,
    user_id: string,
  ): Promise<Post> {
    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const post = this.postsRepository.create({
      content: postData.content,
      media_url: file
        ? await this.uploadService.uploadImage(file, 'Post')
        : null,
      visibility: postData.visibility,
      user: user,
    });

    return this.postsRepository.save(post);
  }
  async update(
    postId: string,
    postData: UpdatePostDto,
    file: Express.Multer.File,
  ): Promise<Post> {
    const post = await this.postsRepository.findOneBy({
      post_id: postId,
    });
    if (!post) {
      throw new NotFoundException(
        'Post not found or you do not have permission to update it',
      );
    }

    // Cập nhật các trường nếu có trong DTO
    if (postData.content !== undefined) {
      post.content = postData.content;
    }

    if (file) {
      post.media_url = await this.uploadService.uploadImage(file, 'Post');
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
