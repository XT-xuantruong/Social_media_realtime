import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseDto } from 'src/response.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req): Promise<ResponseDto<User>> {
    const user = await this.usersService.findById(req.user.userId);
    return new ResponseDto<User>('User retrieved successfully', 200, user);
  }
}
