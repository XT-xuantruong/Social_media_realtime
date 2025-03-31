import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { User} from "../users/user.entity"
  
  @Entity('posts')
  export class Post {
    @PrimaryGeneratedColumn('uuid')
    post_id: string; // UUID làm khóa chính
  
    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    user: User; // Khóa ngoại tới bảng users (user_id)
  
    @Column({ type: 'text' })
    content: string; // Nội dung bài đăng
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    media_url: string; // Link ảnh/video (Cloudinary)
  
    @CreateDateColumn()
    created_at: Date; // Thời gian tạo bài đăng
  
    @UpdateDateColumn({ nullable: true })
    updated_at: Date; // Thời gian chỉnh sửa (có thể null)
  
    @Column({
      type: 'enum',
      enum: ['public', 'friends', 'private'],
      default: 'public',
    })
    visibility: string; // Quyền xem bài đăng
  }