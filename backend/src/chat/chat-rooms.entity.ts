// src/chat/chat-rooms.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ChatRoomUser } from './chat-room-users.entity';
import { Message } from './messages.entity';

@Entity('chat_rooms')
@ObjectType()
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  room_id: string;

  @Column({ type: 'bool', default: false })
  @Field(() => Boolean)
  is_group: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field({ nullable: true })
  name?: string;

  @CreateDateColumn()
  @Field()
  created_at: Date;

  @OneToMany(() => ChatRoomUser, (roomUser) => roomUser.room)
  @Field(() => [ChatRoomUser], { nullable: true })
  roomUsers: ChatRoomUser[];

  @OneToMany(() => Message, (message) => message.room)
  @Field(() => [Message], { nullable: true })
  messages: Message[];
}
