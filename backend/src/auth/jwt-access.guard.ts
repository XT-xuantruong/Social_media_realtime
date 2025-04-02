import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();

    if (gqlContext.connectionParams) {
      const authHeader = gqlContext.connectionParams.Authorization;
      if (!authHeader) {
        throw new UnauthorizedException('Missing Authorization header');
      }
      const token = authHeader.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      if (!payload || payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid or missing access token');
      }
      gqlContext.user = payload;
      return true;
    }

    const result = await super.canActivate(context);
    return result as boolean;
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req || context.switchToHttp().getRequest();
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }
    if (user.tokenType !== 'access') {
      throw new UnauthorizedException('This endpoint requires an access token');
    }
    return user;
  }
}
