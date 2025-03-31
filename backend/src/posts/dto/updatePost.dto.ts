import { IsString, MaxLength, IsEnum } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsEnum(['public', 'friends', 'private'])
  visibility: string;
}