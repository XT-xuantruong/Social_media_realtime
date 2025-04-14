import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatRoomDto } from './dto/createChatRoom.dto';
import { JwtAccessGuard } from 'src/auth/jwt-access.guard';
import { ChatRoom } from './chat-rooms.entity';
import { ResponseDto } from 'src/dto/response.dto';

@Controller('api/chat/rooms')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('')
  @UseGuards(JwtAccessGuard)
  async createRoom(@Body() createRoomDto: CreateChatRoomDto, @Req() req): Promise<ResponseDto<ChatRoom>> {
    const chatRoom = await this.chatService.createChatRoom(createRoomDto, req.user.userId);
    return new ResponseDto<ChatRoom>('Chat room created successfully', 201, chatRoom)
  }
}