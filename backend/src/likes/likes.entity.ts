import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../users/user.entity';
import { Post } from 'src/posts/posts.entity';

@Entity('likes')
@ObjectType()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  like_id: string; // CHAR(36) UUID

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User; // CHAR(36) FK tới users

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @Field(() => Post)
  post: Post; // CHAR(36) FK tới posts

  @CreateDateColumn()
  @Field()
  created_at: Date; // DATETIME
}
