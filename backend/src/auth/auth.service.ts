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

@Injectable()
export class AuthService {
  //   private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private usersService: UsersService,
    @InjectRepository(AuthProvider)
    private authProviderRepo: Repository<AuthProvider>,
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

  //   async login(dto: LoginDto): Promise<{ accessToken: string }> {
  //     const user = await this.userRepository.findOne({
  //       where: { email: dto.email },
  //       select: ['user_id', 'password'],
  //     });
  //     if (!user || !(await bcrypt.compare(dto.password, user.password))) {
  //       throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
  //     }
  //     return { accessToken: this.jwtService.sign({ user_id: user.user_id }) };
  //   }

  //   async googleAuth(token: string) {
  //     const ticket = await this.googleClient.verifyIdToken({
  //       idToken: token,
  //       audience: process.env.GOOGLE_CLIENT_ID,
  //     });
  //     const payload = ticket.getPayload();
  //     let user = await this.userRepository.findOne({
  //       where: { email: payload.email },
  //     });

  //     if (!user) {
  //       user = this.userRepository.create({
  //         email: payload.email,
  //         full_name: payload.name,
  //         avatar_url: payload.picture,
  //       });
  //       await this.userRepository.save(user);
  //     }

  //     return { accessToken: this.jwtService.sign({ user_id: user.user_id }) };
  //   }
}
