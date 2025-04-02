import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Notification } from '../notifications.entity';
import { PageInfo } from 'src/dto/graphql.response.dto';

@ObjectType()
export class NotificationEdge {
  @Field(() => Notification)
  node: Notification;

  @Field()
  cursor: string;
}

@ObjectType()
export class PaginatedResponse {
  @Field(() => [NotificationEdge])
  edges: NotificationEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@ObjectType()
export class NotificationResponse {
  @Field()
  message: string;

  @Field(() => Int)
  status: number;

  @Field(() => PaginatedResponse)
  data: PaginatedResponse;
}
