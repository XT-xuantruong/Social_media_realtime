import { Field, ObjectType } from '@nestjs/graphql';
import { ChatRoom } from '../chat-rooms.entity';
import { PageInfo } from 'src/dto/graphql.response.dto';

@ObjectType()
export class ChatRoomEdge {
  @Field(() => ChatRoom)
  node: ChatRoom;

  @Field(() => String)
  cursor: string;
}

@ObjectType()
export class PaginatedChatRoomsResponse {
  @Field(() => [ChatRoomEdge])
  edges: ChatRoomEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
