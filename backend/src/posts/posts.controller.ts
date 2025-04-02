import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './posts.entity';
import { ResponseDto } from 'src/response.dto';
import { CreatePostDto } from './dto/createPost.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdatePostDto } from './dto/updatePost.dto';
import { JwtAccessGuard } from 'src/auth/jwt-access.guard';

@Controller('api/posts')
export class PostsController {
  constructor(private postService: PostsService) {}

  @Post('')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      // Giới hạn tối đa 5 file
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB mỗi file
    }),
  )
  async create(
    @Req() req,
    @Body() data: CreatePostDto,
    @UploadedFiles() files?: Express.Multer.File[], // Nhận mảng file
  ): Promise<ResponseDto<PostEntity>> {
    const post = await this.postService.create(data, files, req.user.userId);
    return new ResponseDto<PostEntity>('Created Post successfully', 200, post);
  }

  @Put(':id')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('postId') postId: string,
    @Req() req,
    @Body() data: UpdatePostDto,
    @UploadedFiles() files?: Express.Multer.File[], // Nhận mảng file
  ): Promise<ResponseDto<PostEntity>> {
    const updatedPost = await this.postService.update(postId, data, files);
    return new ResponseDto<PostEntity>(
      'Updated Post successfully',
      200,
      updatedPost,
    );
  }

  @Delete(':postId')
  @UseGuards(JwtAccessGuard)
  async delete(@Param('postId') postId: string): Promise<ResponseDto<void>> {
    await this.postService.delete(postId);
    return new ResponseDto<void>('Deleted Post successfully', 200, null);
  }
}
