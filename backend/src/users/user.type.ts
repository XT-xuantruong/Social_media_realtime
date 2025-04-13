import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

enum Privacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends',
}

registerEnumType(Privacy, { name: 'Privacy' });

@ObjectType()
export class UserType {
  @Field(() => ID)
  @Expose()
  id: string;

  @Field()
  @Expose()
  email: string;

  @Field({ nullable: true })
  @Expose()
  password?: string;

  @Field({ nullable: true })
  @Expose()
  full_name?: string;

  @Field({ nullable: true })
  @Expose()
  avatar_url?: string;

  @Field({ nullable: true })
  @Expose()
  bio?: string;

  @Field(() => Privacy, { defaultValue: Privacy.PUBLIC })
  @Expose()
  privacy: Privacy;

  @Field()
  @Expose()
  created_at: Date;

  @Field()
  @Expose()
  is_verified: boolean;

  @Field({ nullable: true })
  @Expose()
  otp_code?: string;

  @Field({ nullable: true })
  @Expose()
  otp_expires_at?: Date;
}