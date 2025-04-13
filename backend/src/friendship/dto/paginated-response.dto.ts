import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserType } from 'src/users/user.type';
import { Friendship } from '../friendship.entity';

@ObjectType()
export class PaginatedUserResponse {
  @Field(() => [UserType], { nullable: true })
  items: UserType[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class PaginatedFriendshipResponse {
  @Field(() => [Friendship], { nullable: true })
  items: Friendship[];

  @Field(() => Int)
  total: number;
}