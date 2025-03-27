import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { AuthProvider } from './auth-provider.entity';
import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto/login.dto';
import { JwtService } from '@nestjs/jwt';
// import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { ResponseDto } from 'src/response.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from './refresh-token.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  //   private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @InjectRepository(AuthProvider)
    private authProviderRepo: Repository<AuthProvider>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<ResponseDto<User>> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      return new ResponseDto<any>('Email already exists!', 400, null);
    }

    const newUser = await this.usersService.create(dto);
    const authProvider = this.authProviderRepo.create({
      user: newUser,
      provider: 'email',
      provider_id: newUser.id,
    });

    await this.authProviderRepo.save(authProvider);

    return new ResponseDto<User>('Register successfully!', 200, newUser);
  }

  async login(dto: LoginDto): Promise<ResponseDto<any>> {
    const user = await this.usersService.findByEmail(dto.email);
    console.log(user);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      return new ResponseDto<any>('Email or password not correct!', 401, null);
    }
    const accessToken = this.jwtService.sign({
      user_id: user.id,
      token_type: 'access',
    });
    const refreshToken = this.jwtService.sign(
      { user_id: user.id, token_type: 'refresh' },
      {
        expiresIn: '7d',
      },
    );
    const newRefreshToken = this.refreshTokenRepo.create({
      user: user,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepo.save(newRefreshToken);
    return new ResponseDto<any>('Logged in successfully!', 200, {
      user,
      accessToken,
      refreshToken,
    });
  }

  async googleAuth(googleUser: any) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersService.create({
        email: googleUser.email,
        full_name: googleUser.fullName,
        password: this.configService.get<string>('AUTH_PASS'),
      });
    }

    let authProvider = await this.authProviderRepo.findOne({
      where: { provider: 'google', provider_id: googleUser.providerId },
    });

    if (!authProvider) {
      authProvider = this.authProviderRepo.create({
        user: user,
        provider: 'google',
        provider_id: googleUser.providerId,
      });
      await this.authProviderRepo.save(authProvider);
    }

    const accessToken = this.jwtService.sign({
      user_id: user.id,
      token_type: 'access',
    });
    const refreshToken = this.jwtService.sign(
      { user_id: user.id, token_type: 'refresh' },
      {
        expiresIn: '7d',
      },
    );
    const newRefreshToken = this.refreshTokenRepo.create({
      user: user,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepo.save(newRefreshToken);
    return new ResponseDto<any>('Logged in successfully!', 200, {
      user,
      accessToken,
      refreshToken,
    });
  }
}
