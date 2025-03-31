import { IsEnum, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @MaxLength(100)
    full_name?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    avatar_url?: string;
  
    @IsString()
    bio?: string;
  
    @IsEnum(['public', 'private', 'friends'])
    privacy?: string;
  }