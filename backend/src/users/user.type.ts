import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

enum Privacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends',
}

registerEnumType(Privacy, { name: 'Privacy' });

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  full_name?: string;

  @Field({ nullable: true })
  avatar_url?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => Privacy, { defaultValue: Privacy.PUBLIC })
  privacy: Privacy;

  @Field()
  created_at: Date;

  @Field()
  is_verified: boolean;

  @Field({ nullable: true })
  otp_code?: string;

  @Field({ nullable: true })
  otp_expires_at?: Date;
}