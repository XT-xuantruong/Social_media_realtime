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
        private uploadService: UploadService, // Inject UploadService
    ) { }

    async create(postData: CreatePostDto, file: Express.Multer.File, user_id: string): Promise<Post> {
        const user = await this.userRepository.findOneBy({ id: user_id });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const post = this.postsRepository.create({
            content: postData.content,
            media_url: await this.uploadService.uploadImage(file, "Post"),
            visibility: postData.visibility,
            user: user,
        });

        return this.postsRepository.save(post);
    }

    async update(postId: string, postData: UpdatePostDto, file: Express.Multer.File): Promise<Post> {
        const post = await this.postsRepository.findOneBy({
            post_id: postId
        });
        if (!post) {
            throw new NotFoundException('Post not found or you do not have permission to update it');
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

}
