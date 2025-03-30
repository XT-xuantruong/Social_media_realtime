// src/auth/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { AuthProvider } from './auth-provider.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ResponseDto } from 'src/response.dto';
import { MailService } from '../mailer/mailer.service';
import { RefreshToken } from './refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthProvider)
    private authProviderRepo: Repository<AuthProvider>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  // Tạo access token
  private generateAccessToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      token_type: 'access',
    });
  }

  // Tạo refresh token
  private generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, token_type: 'refresh' },
      { expiresIn: '7d' },
    );
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto): Promise<ResponseDto<User>> {
    const user = await this.usersService.create(registerDto);
    const otp = this.generateOtp();
    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await this.usersService.update(user);

    await this.mailService.sendOtpEmail(user.email, otp, user.full_name);

    const auth_provider = this.authProviderRepo.create({
      user,
      provider: 'email',
      provider_id: user.id,
    });
    await this.authProviderRepo.save(auth_provider);

    return new ResponseDto<User>(
      'We sent a code to your email for validate',
      201,
      user,
    );
  }

  async login(loginDto: LoginDto): Promise<ResponseDto<any>> {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user.is_verified) {
      return new ResponseDto('Email not verified', 401, null);
    }
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const newRefreshToken = this.refreshTokenRepo.create({
      user,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepo.save(newRefreshToken);

    return new ResponseDto<any>('Logged in successfully', 200, {
      accessToken,
      refreshToken,
    });
  }

  async googleAuth(googleUser: any): Promise<ResponseDto<any>> {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersService.create({
        email: googleUser.email,
        full_name: googleUser.fullName,
        password: null,
      });
    }

    let authProvider = await this.authProviderRepo.findOne({
      where: { provider: 'google', provider_id: googleUser.providerId },
    });

    if (!authProvider) {
      authProvider = this.authProviderRepo.create({
        user,
        provider: 'google',
        provider_id: googleUser.providerId,
      });
      await this.authProviderRepo.save(authProvider);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const newRefreshToken = this.refreshTokenRepo.create({
      user,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepo.save(newRefreshToken);

    return new ResponseDto<any>('Logged in successfully', 200, {
      accessToken,
      refreshToken,
    });
  }

  async sendOtp(email: string): Promise<ResponseDto<any>> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return new ResponseDto('User not found', 404, null);
    }

    const otp = this.generateOtp();
    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await this.usersService.update(user);

    await this.mailService.sendOtpEmail(email, otp, user.full_name);
    return new ResponseDto('OTP sent successfully', 200, null);
  }

  async verifyOtp(email: string, otp: string): Promise<ResponseDto<any>> {
    const user = await this.usersService.findByEmail(email);
    if (
      !user ||
      user.otp_code !== otp ||
      !user.otp_expires_at ||
      user.otp_expires_at < new Date()
    ) {
      return new ResponseDto('Invalid or expired OTP', 400, null);
    }

    user.otp_code = null;
    user.otp_expires_at = null;
    user.is_verified = true;
    await this.usersService.update(user);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const newRefreshToken = this.refreshTokenRepo.create({
      user,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepo.save(newRefreshToken);

    return new ResponseDto('OTP verified successfully', 200, {
      user,
      accessToken,
      refreshToken,
    });
  }

  async refreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<ResponseDto<any>> {
    // 1. Tìm refresh token trong database
    const refreshTokenRecord = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!refreshTokenRecord) {
      throw new BadRequestException('Invalid refresh token');
    }

    // 2. Kiểm tra token có hết hạn không
    if (refreshTokenRecord.expires_at < new Date()) {
      await this.refreshTokenRepo.delete(refreshTokenRecord.token_id);
      throw new BadRequestException('Refresh token has expired');
    }

    // 3. Kiểm tra userId từ payload có khớp với user trong refresh token không
    if (refreshTokenRecord.user.id !== userId) {
      throw new BadRequestException('Invalid refresh token for this user');
    }

    // 4. Tạo access token và refresh token mới
    const user = refreshTokenRecord.user;
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    // 5. Cập nhật refresh token mới vào database
    const newRefreshTokenRecord = this.refreshTokenRepo.create({
      user,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepo.save(newRefreshTokenRecord);

    // 6. Xóa refresh token cũ
    await this.refreshTokenRepo.delete(refreshTokenRecord.token_id);

    return new ResponseDto('Tokens refreshed successfully', 200, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }

  async logout(
    refreshToken: string,
    userId: string,
  ): Promise<ResponseDto<any>> {
    // 1. Tìm refresh token trong database
    const refreshTokenRecord = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!refreshTokenRecord) {
      throw new BadRequestException('Invalid refresh token');
    }

    // 2. Kiểm tra token có hết hạn không
    if (refreshTokenRecord.expires_at < new Date()) {
      await this.refreshTokenRepo.delete(refreshTokenRecord.token_id);
      throw new BadRequestException('Refresh token has expired');
    }

    // 3. Kiểm tra userId từ payload có khớp với user trong refresh token không
    if (refreshTokenRecord.user.id !== userId) {
      throw new BadRequestException('Invalid refresh token for this user');
    }
    // 4. Xóa refresh token
    await this.refreshTokenRepo.delete(refreshTokenRecord.token_id);
    return new ResponseDto('Logged out', 200, null);
  }
}
