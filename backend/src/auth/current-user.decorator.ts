import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();

    // WebSocket context: Lấy user từ gqlContext.user
    if (gqlContext.connectionParams) {
      return gqlContext.user;
    }

    // HTTP context: Lấy user từ request
    const request = gqlContext.req || context.switchToHttp().getRequest();
    return request.user;
  },
);
