import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { AuthProvider } from 'src/auth/auth-provider.entity';
import { RefreshToken } from 'src/auth/refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ length: 100, nullable: true })
  full_name?: string;

  @Column({ length: 255, nullable: true })
  avatar_url?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({
    type: 'enum',
    enum: ['public', 'private', 'friends'],
    default: 'public',
  })
  privacy: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ length: 6, nullable: true })
  otp_code?: string;

  @Column({ type: 'datetime', nullable: true })
  otp_expires_at?: Date;

  @OneToMany(() => AuthProvider, (authProvider) => authProvider.user)
  authProviders: AuthProvider[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
