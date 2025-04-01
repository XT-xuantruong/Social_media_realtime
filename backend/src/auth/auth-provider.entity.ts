import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../users/user.entity';

@Entity('auth_providers')
@ObjectType()
export class AuthProvider {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  auth_id: string;

  @ManyToOne(() => User, (user) => user.authProviders, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User;

  @Column({ type: 'enum', enum: ['email', 'google'] })
  @Field()
  provider: 'email' | 'google';

  @Column({ length: 255 })
  @Field()
  provider_id: string;

  @CreateDateColumn()
  @Field()
  created_at: Date;
}
