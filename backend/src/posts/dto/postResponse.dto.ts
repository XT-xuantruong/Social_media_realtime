import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from '../posts.entity';
import { PageInfo } from 'src/dto/graphql.response.dto';

// PostEdge cho danh sách bài đăng
@ObjectType()
export class PostEdge {
  @Field(() => Post)
  node: Post;

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
