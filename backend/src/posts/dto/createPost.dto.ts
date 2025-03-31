import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(1000) // Limit content to 1000 characters, similar to how full_name is limited to 100 in UpdateUserDto
  content: string;

  @IsEnum(['public', 'friends', 'private'])
  visibility: string;
}