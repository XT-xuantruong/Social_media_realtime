import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../users/user.entity';
import { Like } from 'src/likes/likes.entity';
import { Comment } from 'src/comments/comments.entity';

@Entity('posts')
@ObjectType()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  post_id: string; // UUID làm khóa chính

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User; // Khóa ngoại tới bảng users (user_id)

  @Column({ type: 'text' })
  @Field()
  content: string; // Nội dung bài đăng

  @Column({ type: 'json', nullable: true }) // Sử dụng JSON để lưu mảng URL
  @Field(() => [String], { nullable: true })
  media_url: string[]; // Link ảnh/video (Cloudinary)

  @CreateDateColumn()
  @Field()
  created_at: Date; // Thời gian tạo bài đăng

  @UpdateDateColumn({ nullable: true })
  @Field({ nullable: true })
  updated_at: Date; // Thời gian chỉnh sửa (có thể null)

  @Column({
    type: 'enum',
    enum: ['public', 'friends', 'private'],
    default: 'public',
  })
  @Field()
  visibility: string; // Quyền xem bài đăng

  @OneToMany(() => Like, (like) => like.post)
  @Field(() => [Like], { nullable: true })
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.post)
  @Field(() => [Comment], { nullable: true })
  comments: Comment[];
}
