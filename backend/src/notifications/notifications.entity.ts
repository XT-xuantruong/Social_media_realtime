import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../users/user.entity';

@Entity('notifications')
@ObjectType()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  notification_id: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User;

  @Column({
    type: 'enum',
    enum: ['like', 'comment', 'message', 'friend_request'],
  })
  @Field()
  type: 'like' | 'comment' | 'message' | 'friend_request';

  @Column()
  @Field()
  related_id: string;

  @Column({ default: false })
  @Field()
  is_read: boolean;

  @CreateDateColumn()
  @Field()
  created_at: Date;
}
