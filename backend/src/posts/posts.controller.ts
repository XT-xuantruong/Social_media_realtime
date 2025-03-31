import { Body, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtGuard } from 'src/auth/jwt-auth.guard';
import { Post as PostEntity } from './posts.entity';
import { ResponseDto } from 'src/response.dto';
import { CreatePostDto } from './dto/createPost.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/posts')
export class PostsController {
     constructor(private postService: PostsService) {}
    
      @Post('')
      @UseGuards(new JwtGuard('access')) 
      @UseInterceptors(FileInterceptor('file', {
          limits: { fileSize: 5 * 1024 * 1024 }, 
        })) 
      async create(
        @Req() req,
        @Body() data: CreatePostDto,
        @UploadedFile() file?: Express.Multer.File,): Promise<ResponseDto<PostEntity>> {
        const post = await this.postService.create(data,file, req.user.userId);
        return new ResponseDto<PostEntity>('Created Post successfully', 200, post);
      }
}
