import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comments.entity';
import { Post } from 'src/posts/posts.entity';
import { User } from '../users/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createComment(
    postId: string,
    content: string,
    userId: string,
  ): Promise<Comment> {
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

    // Tạo comment mới
    const comment = this.commentsRepository.create({
      post,
      user,
      content,
    });
    console.log(userId, comment.user.id);

    return this.commentsRepository.save(comment);
  }

  async deleteComment(commentId: string, userId: string): Promise<string> {
    // Tìm comment
    const comment = await this.commentsRepository.findOne({
      where: { comment_id: commentId },
      relations: ['user'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    console.log(userId, comment.user.id);

    // Kiểm tra quyền xóa (chỉ người tạo comment mới được xóa)
    if (comment.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
    return 'Comment deleted successfully';
  }
}
