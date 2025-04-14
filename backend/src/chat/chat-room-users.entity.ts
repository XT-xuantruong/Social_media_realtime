import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
  } from 'typeorm';
  import { ObjectType, Field, ID } from '@nestjs/graphql';
  import { ChatRoom } from './chat-rooms.entity';
  import { User } from '../users/user.entity';
  
  @Entity('chat_room_users')
  @ObjectType()
  export class ChatRoomUser {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    room_user_id: string; // CHAR(36) UUID làm khóa chính
  
    @ManyToOne(() => User, (user) => user.chatRoomUsers, { onDelete: 'CASCADE' })
    @Field(() => User, { nullable: true })
    user: User;
  
    @ManyToOne(() => ChatRoom, (room) => room.roomUsers, { onDelete: 'CASCADE' })
    @Field(() => ChatRoom, { nullable: true })
    room: ChatRoom;
  }