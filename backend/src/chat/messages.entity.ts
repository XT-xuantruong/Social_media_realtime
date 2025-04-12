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
    message_id: string; // CHAR(36) UUID làm khóa chính
  
    @Column()
    @Field(() => ID)
    room_id: string; // CHAR(36) FK tới chat_rooms
  
    @Column()
    @Field(() => ID)
    user_id: string; // CHAR(36) FK tới users
  
    @Column({ type: 'text' })
    @Field()
    content: string; // TEXT, nội dung tin nhắn
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    @Field({ nullable: true })
    media_url?: string; // VARCHAR(255), link file đính kèm
  
    @CreateDateColumn()
    @Field()
    created_at: Date; // DATETIME, thời gian gửi tin nhắn
  
    @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: 'CASCADE' })
    @Field(() => ChatRoom, { nullable: true })
    room: ChatRoom;
  
    @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
    @Field(() => User, { nullable: true })
    user: User;
  }