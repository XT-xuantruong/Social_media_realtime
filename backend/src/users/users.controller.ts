import {
  Controller,
  Get,
  Put,
  Req,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { ResponseDto } from 'src/response.dto';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAccessGuard } from 'src/auth/jwt-access.guard';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAccessGuard)
  async getMe(@Req() req): Promise<ResponseDto<User>> {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...userWithoutPassword } = user;
    return new ResponseDto<User>(
      'User retrieved successfully',
      200,
      userWithoutPassword,
    );
  }

  @Put('me')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateMe(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseDto<User>> {
    console.log('File received:', file);
    console.log('Body received:', updateUserDto);

    const updatedUser = await this.usersService.updateMe(
      req.user.userId,
      updateUserDto,
      file,
    );
    return new ResponseDto<User>('User updated successfully', 200, updatedUser);
  }
}
