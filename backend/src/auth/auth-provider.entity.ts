import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('auth_providers')
export class AuthProvider {
  @PrimaryGeneratedColumn('uuid')
  auth_id: string;

  @ManyToOne(() => User, (user) => user.authProviders, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: ['email', 'google'] })
  provider: 'email' | 'google';

  @Column({ length: 255 })
  provider_id: string;

  @CreateDateColumn()
  created_at: Date;
}
