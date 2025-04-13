import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PageInfo } from 'src/dto/graphql.response.dto';
import { User } from 'src/users/user.entity';

// UserEdge cho danh sách người dùng phân trang
@ObjectType()
export class UserEdge {
  @Field(() => User)
  node: User;

  @Field()
  cursor: string;
}

// Phản hồi cho danh sách người dùng
@ObjectType()
export class UserResponse {
  @Field()
  message: string;

  @Field(() => Int)
  status: number;

  @Field(() => [UserEdge])
  edges: UserEdge[];

  @Field(() => PageInfo) 
  pageInfo: PageInfo;
}