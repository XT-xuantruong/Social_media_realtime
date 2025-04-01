import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './likes.entity';
import { Post } from 'src/posts/posts.entity';
import { User } from '../users/user.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async likePost(postId: string, userId: string): Promise<string> {
    // Kiểm tra bài đăng có tồn tại không
    const post = await this.postsRepository.findOne({
      where: { post_id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Kiểm tra user có tồn tại không
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra xem user đã like bài đăng này chưa
    const existingLike = await this.likesRepository.findOne({
      where: { post: { post_id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      throw new BadRequestException('You have already liked this post');
    }

    // Tạo lượt thích mới
    const like = this.likesRepository.create({
      user,
      post,
    });

    await this.likesRepository.save(like);
    return 'Post liked successfully';
  }

  async unlikePost(postId: string, userId: string): Promise<string> {
    // Kiểm tra bài đăng có tồn tại không
    const post = await this.postsRepository.findOne({
      where: { post_id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Kiểm tra user có tồn tại không
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Tìm lượt thích để xóa
    const like = await this.likesRepository.findOne({
      where: { post: { post_id: postId }, user: { id: userId } },
    });

    if (!like) {
      throw new BadRequestException('You have not liked this post');
    }

    await this.likesRepository.remove(like);
    return 'Post unliked successfully';
  }
}
