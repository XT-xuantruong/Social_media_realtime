import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FriendshipService } from './friendship.service';
import { Friendship } from './friendship.entity';
import { PaginatedUserResponse, PaginatedFriendshipResponse } from './dto/paginated-response.dto';

@Resolver(() => Friendship)
export class FriendshipResolver {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Query(() => PaginatedUserResponse, { name: 'getFriends' })
  async getFriends(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('offset', { type: () => Int, nullable: true }) offset: number,
    @Args('currentUserId') currentUserId: string,
  ): Promise<PaginatedUserResponse> {
    return this.friendshipService.getFriends(limit, offset, currentUserId);
  }

  @Query(() => PaginatedFriendshipResponse, { name: 'getFriendRequests' })
  async getFriendRequests(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('offset', { type: () => Int, nullable: true }) offset: number,
    @Args('currentUserId') currentUserId: string,
  ): Promise<PaginatedFriendshipResponse> {
    return this.friendshipService.getFriendRequests(limit, offset, currentUserId);
  }

  @Mutation(() => Friendship)
  async sendFriendRequest(
    @Args('friendId') friendId: string,
    @Args('currentUserId') currentUserId: string,
  ): Promise<Friendship> {
    return this.friendshipService.sendFriendRequest(friendId, currentUserId);
  }

  @Mutation(() => Friendship)
  async acceptFriendRequest(
    @Args('friendshipId') friendshipId: string,
    @Args('currentUserId') currentUserId: string,
  ): Promise<Friendship> {
    return this.friendshipService.acceptFriendRequest(friendshipId, currentUserId);
  }

  @Mutation(() => Boolean)
  async rejectFriendRequest(
    @Args('friendshipId') friendshipId: string,
    @Args('currentUserId') currentUserId: string,
  ): Promise<boolean> {
    await this.friendshipService.rejectFriendRequest(friendshipId, currentUserId);
    return true;
  }

  @Mutation(() => Boolean)
  async removeFriend(
    @Args('friendshipId') friendshipId: string,
    @Args('currentUserId') currentUserId: string,
  ): Promise<boolean> {
    await this.friendshipService.removeFriend(friendshipId, currentUserId);
    return true;
  }
}