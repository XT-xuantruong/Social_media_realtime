// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/user.entity';
import { ResponseDto } from 'src/response.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtGuard } from './jwt-auth.guard';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/register')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: RegisterDto): Promise<ResponseDto<User>> {
    return await this.authService.register(registerDto);
  }

  @Post('auth/login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto): Promise<ResponseDto<any>> {
    return await this.authService.login(loginDto);
  }

  @Get('auth/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // Bắt đầu flow OAuth
  }

  @Get('auth/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    return await this.authService.googleAuth(req.user);
  }

  @Post('auth/otp/send')
  @UsePipes(new ValidationPipe())
  async sendOtp(@Body('email') email: string): Promise<ResponseDto<any>> {
    return await this.authService.sendOtp(email);
  }

  @Post('auth/otp/verify')
  @UsePipes(new ValidationPipe())
  async verifyOtp(
    @Body() body: { email: string; otp: string },
  ): Promise<ResponseDto<any>> {
    return await this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('auth/refresh')
  @UseGuards(new JwtGuard('refresh')) // Yêu cầu refresh token
  @UsePipes(new ValidationPipe())
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Req() req,
  ): Promise<ResponseDto<any>> {
    console.log(req);
    
    return await this.authService.refreshToken(refreshToken, req.user.userId);
  }
}