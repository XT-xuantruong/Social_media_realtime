import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatRoomDto } from './dto/createChatRoom.dto';
import { JwtAccessGuard } from 'src/auth/jwt-access.guard';

@Controller('api/chat/rooms')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('')
  @UseGuards(JwtAccessGuard)
  createRoom(@Body() createRoomDto: CreateChatRoomDto, @Req() req) {
    return this.chatService.createChatRoom(createRoomDto, req.user.userId);
  }
}