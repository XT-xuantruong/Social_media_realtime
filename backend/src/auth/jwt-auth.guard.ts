// src/auth/jwt.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private tokenType: 'access' | 'refresh') {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }

    // Kiểm tra tokenType phù hợp với yêu cầu của guard
    if (user.tokenType !== this.tokenType) {
      throw new UnauthorizedException(`This endpoint requires a ${this.tokenType} token`);
    }

    return user;
  }
}