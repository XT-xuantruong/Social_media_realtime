import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Message } from '../messages.entity';
import { PageInfo } from 'src/dto/graphql.response.dto';

@ObjectType()
export class MessageEdge {
  @Field(() => Message)
  node: Message;

  @Field(() => String)
  cursor: string;
}

@ObjectType()
export class MessageResponse {
  @Field(() => String)
  message: string;

  @Field(() => Int)
  status: number;

  @Field(() => Message, { nullable: true })
  data: Message | null;

  constructor(message: string, status: number, data: Message | null) {
    this.message = message;
    this.status = status;
    this.data = data;
  }
}

@ObjectType()
export class MessagesListResponse {
  @Field(() => String)
  message: string;

  @Field(() => Int)
  status: number;

  @Field(() => [MessageEdge])
  edges: MessageEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo; // Sử dụng PageInfo từ file chung

  constructor(
    message: string,
    status: number,
    edges: MessageEdge[],
    pageInfo: PageInfo,
  ) {
    this.message = message;
    this.status = status;
    this.edges = edges;
    this.pageInfo = pageInfo;
  }
}
