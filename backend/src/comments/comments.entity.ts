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

@Entity('comments')
@ObjectType()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  comment_id: string; // CHAR(36) UUID

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @Field(() => User, { nullable: true })
  user: User; // CHAR(36) FK tới users

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @Field(() => Post)
  post: Post; // CHAR(36) FK tới posts

  @Column({ type: 'text' })
  @Field()
  content: string; // TEXT

  @CreateDateColumn()
  @Field()
  created_at: Date; // DATETIME
}
