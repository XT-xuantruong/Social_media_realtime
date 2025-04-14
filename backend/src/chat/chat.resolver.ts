import { Resolver, Mutation, Args, Query, Context, Int } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { SendMessageInput } from './dto/send-message.dto';
import { MessageResponse, MessagesListResponse } from './dto/response.type';
import { UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from '../auth/jwt-access.guard';
import { PaginatedChatRoomsResponse } from './dto/chatroom.dto';
import { ChatGateway } from './chat.gateway'; // Thêm import

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway, // Tiêm ChatGateway
  ) {}

  @Mutation(() => MessageResponse)
  @UseGuards(JwtAccessGuard)
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @Context() context: any,
  ): Promise<MessageResponse> {
    try {
      const userId = context.req.user.userId;
      const message = await this.chatService.sendMessage(input, userId);

      // Phát sự kiện newMessage qua ChatGateway
      this.chatGateway.emitNewMessage(input.room_id, message);

      return new MessageResponse('Message sent successfully', 201, message);
    } catch (error) {
      console.error('Error in sendMessage resolver:', error.message);
      return new MessageResponse(error.message, error.status || 400, null);
    }
  }

  @Query(() => MessagesListResponse)
  @UseGuards(JwtAccessGuard)
  async getMessages(
    @Args('room_id') roomId: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Context() context: any,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ): Promise<MessagesListResponse> {
    try {
      const userId = context.req.user.userId;
      const { edges, pageInfo } = await this.chatService.getMessages(
        roomId,
        userId,
        limit,
        cursor,
      );

      return new MessagesListResponse(
        'Messages retrieved successfully',
        200,
        edges,
        pageInfo,
      );
    } catch (error) {
      console.error('Error in getMessages resolver:', error.message);
      return new MessagesListResponse(error.message, error.status || 400, [], {
        endCursor: null,
        hasNextPage: false,
        total: 0,
      });
    }
  }

  @Query(() => PaginatedChatRoomsResponse)
  @UseGuards(JwtAccessGuard)
  async getChatRooms(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('cursor', { type: () => String, nullable: true })
    cursor: string | undefined,
    @Context() context: any,
  ): Promise<PaginatedChatRoomsResponse> {
    try {
      const userId = context.req.user.userId;
      return await this.chatService.getChatRooms(userId, limit, cursor);
    } catch (error) {
      console.error('Error in getChatRooms resolver:', error.message);
      throw new Error(error.message);
    }
  }
}
