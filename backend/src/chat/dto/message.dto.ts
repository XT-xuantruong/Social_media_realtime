// src/chat/dto/message.dto.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class MessageDto {
  @Field(() => ID)
  message_id: string;

  @Field()
  content: string;

  @Field()
  created_at: Date;

  @Field()
  room_id: string;

  @Field()
  sender_id: string;
}