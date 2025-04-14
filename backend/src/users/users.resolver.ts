import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserResponse } from './dto/userResponse.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from 'src/auth/jwt-access.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from './user.entity';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => UserResponse)
  @UseGuards(JwtAccessGuard)
  async searchUsers(
    @Args('query', { type: () => String }) query: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor: string,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    try {
      const result = await this.usersService.searchUsers(query, limit, cursor);
      return {
        message: 'Tìm kiếm người dùng thành công',
        status: 200,
        edges: result.edges,
        pageInfo: result.pageInfo,
      };
    } catch (error) {
      return {
        message: `Tìm kiếm người dùng thất bại: ${error.message}`,
        status: 500,
        edges: [],
        pageInfo: { endCursor: null, hasNextPage: false, total: 0 },
      };
    }
  }
}