import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/user.entity';
import { UserType } from 'src/users/user.type';

@ObjectType()
@Entity()
export class Friendship {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  friendshipId: string;

  @Field(() => UserType)
  @ManyToOne(() => User, { eager: true })
  user: User;

  @Field(() => UserType)
  @ManyToOne(() => User, { eager: true })
  friend: User;

  @Field()
  @Column()
  status: string;

  @Field()
  @Column()
  createdAt: string;
}