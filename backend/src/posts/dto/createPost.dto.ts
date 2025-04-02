import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class CreatePostDto {
  @IsString()
  content: string;

  @IsEnum(['public', 'friends', 'private'])
  @IsOptional()
  visibility: string;
}
