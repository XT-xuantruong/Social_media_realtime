import { IsString, MaxLength, IsEnum, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  content: string;

  @IsEnum(['public', 'friends', 'private'])
  @IsOptional()
  visibility: string;
}
