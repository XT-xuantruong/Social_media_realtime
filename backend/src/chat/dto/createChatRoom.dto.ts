// src/chat/dto/create-room.dto.ts
import { IsBoolean, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateChatRoomDto {
  @IsBoolean()
  @IsOptional()
  is_group?: boolean;

  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  user_ids: string[];
}