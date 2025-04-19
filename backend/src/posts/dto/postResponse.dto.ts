import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from '../posts.entity';
import { PageInfo } from 'src/dto/graphql.response.dto';
import { Like } from 'src/likes/likes.entity';
import { User } from 'src/users/user.entity';

@ObjectType()
export class PostCustom extends Post {
  @Field()
  isLike: boolean;
}
// PostEdge cho danh sách bài đăng
@ObjectType()
export class PostEdge {
  @Field(() => PostCustom)
  node: PostCustom;

  @Field()
  cursor: string;

  @Field(() => Int)
  likeCount: number;

  @Field(() => Int)
  commentCount: number;
}

// Response cho một bài đăng
@ObjectType()
export class PostResponse {
  @Field()
  message: string;

  @Field(() => Int)
  status: number;

  @Field(() => Post)
  data: Post;

  @Field(() => PageInfo, { nullable: true })
  pagination?: PageInfo;

  @Field(() => Int)
  likeCount: number;

  @Field(() => Int)
  commentCount: number;
}

// Response cho danh sách bài đăng
@ObjectType()
export class PostsListResponse {
  @Field()
  message: string;

  @Field(() => Int)
  status: number;

  @Field(() => [PostEdge])
  edges: PostEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
