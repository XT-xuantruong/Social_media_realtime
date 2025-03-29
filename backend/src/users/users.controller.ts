// src/users/users.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseDto } from 'src/response.dto';
import { User } from './user.entity';
import { JwtGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(new JwtGuard('access')) // Yêu cầu access token
  async getMe(@Req() req): Promise<ResponseDto<User>> {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...userWithoutPassword } = user;
    return new ResponseDto<User>('User retrieved successfully', 200, userWithoutPassword);
  }
}