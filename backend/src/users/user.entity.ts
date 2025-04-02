import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AuthProvider } from 'src/auth/auth-provider.entity';
import { RefreshToken } from 'src/auth/refresh-token.entity';
import { Post } from 'src/posts/posts.entity';
import { Like } from 'src/likes/likes.entity';
import { Comment } from 'src/comments/comments.entity';
import { Notification } from 'src/notifications/notifications.entity';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true, length: 255 })
  @Field()
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  full_name?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  avatar_url?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  bio?: string;

  @Column({
    type: 'enum',
    enum: ['public', 'private', 'friends'],
    default: 'public',
  })
  @Field()
  privacy: string;

  @CreateDateColumn()
  @Field()
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  @Field()
  is_verified: boolean;

  @Column({ length: 6, nullable: true })
  @Field({ nullable: true })
  otp_code?: string;

  @Column({ type: 'datetime', nullable: true })
  @Field({ nullable: true })
  otp_expires_at?: Date;

  @OneToMany(() => AuthProvider, (authProvider) => authProvider.user)
  @Field(() => [AuthProvider], { nullable: true })
  authProviders: AuthProvider[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  @Field(() => [RefreshToken], { nullable: true })
  refreshTokens: RefreshToken[];

  @OneToMany(() => Post, (post) => post.user)
  @Field(() => [Post], { nullable: true })
  posts: Post[];

  @OneToMany(() => Like, (like) => like.user)
  @Field(() => [Like], { nullable: true })
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.user)
  @Field(() => [Comment], { nullable: true })
  comments: Comment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  @Field(() => [Notification], { nullable: true })
  notifications: Notification[];
}
