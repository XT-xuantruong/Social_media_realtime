// src/chat/messages.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ChatRoom } from './chat-rooms.entity';
import { User } from '../users/user.entity';

@Entity('messages')
@ObjectType()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  message_id: string;

  @Column({
    type: 'text',
    nullable: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  @Field({ nullable: true })
  content: string;

  @CreateDateColumn()
  @Field(() => Date)
  created_at: Date;

  @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: 'CASCADE' })
  @Field(() => ChatRoom)
  room: ChatRoom;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  @Field(() => User)
  sender: User;
}
