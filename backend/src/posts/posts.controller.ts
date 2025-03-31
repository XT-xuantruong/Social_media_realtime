import { Body, Controller, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtGuard } from 'src/auth/jwt-auth.guard';
import { Post as PostEntity } from './posts.entity';
import { ResponseDto } from 'src/response.dto';
import { CreatePostDto } from './dto/createPost.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePostDto } from './dto/updatePost.dto';

@Controller('api/posts')
export class PostsController {
    constructor(private postService: PostsService) { }

    @Post('')
    @UseGuards(new JwtGuard('access'))
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    async create(
        @Req() req,
        @Body() data: CreatePostDto,
        @UploadedFile() file?: Express.Multer.File,): Promise<ResponseDto<PostEntity>> {
        const post = await this.postService.create(data, file, req.user.userId);
        return new ResponseDto<PostEntity>('Created Post successfully', 200, post);
    }

    @Put(':id')
    @UseGuards(new JwtGuard('access'))
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    async update(
        @Param('postId') postId: string,
        @Req() req,
        @Body() data: UpdatePostDto,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<ResponseDto<PostEntity>> {
        const updatedPost = await this.postService.update(postId, data, file);
        return new ResponseDto<PostEntity>('Updated Post successfully', 200, updatedPost);
    }
}
