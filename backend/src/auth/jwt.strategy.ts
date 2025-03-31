// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: (req) => {
        // Nếu request có body và refreshToken (dùng cho /auth/refresh)
        if (req?.body?.refreshToken) {
          return req.body.refreshToken;
        }
        // Mặc định lấy từ Authorization header (dùng cho access token)
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: any, req: any) {
    const tokenType = payload.token_type;

    // Validate access token
    if (tokenType === 'access') {
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return { userId: payload.sub, email: payload.email, tokenType: 'access' };
    }

    // Validate refresh token
    if (tokenType === 'refresh') {
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return { userId: payload.sub, email: payload.email, tokenType: 'refresh' };
    }

    throw new UnauthorizedException('Invalid token type');
  }
}