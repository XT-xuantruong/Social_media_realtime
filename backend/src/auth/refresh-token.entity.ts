import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/user.entity';

@Entity('refresh_tokens')
@ObjectType()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  token_id: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User;

  @Column({ unique: true, length: 255 })
  @Field()
  token: string;

  @Column({ type: 'datetime' })
  @Field()
  expires_at: Date;

  @CreateDateColumn()
  @Field()
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  @Field()
  is_revoked: boolean;
}
