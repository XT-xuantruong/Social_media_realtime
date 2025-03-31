import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadService } from 'src/upload/upload.service';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/createPost.dto';
import { Post } from './posts.entity';

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
}
