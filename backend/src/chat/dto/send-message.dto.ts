// src/chat/dto/send-message.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class SendMessageInput {
  @Field(() => ID)
  room_id: string;

  @Field()
  content: string;
}