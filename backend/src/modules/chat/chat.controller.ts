import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateThreadDto, SendMessageDto } from './dto';
import { CurrentUser } from '../../common/decorators';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('threads')
  getThreads(
    @CurrentUser('id') userId: string,
    @Query('profile_id') profileId: string,
  ) {
    return this.chatService.getThreads(userId, profileId);
  }

  @Post('threads')
  createThread(
    @Body() dto: CreateThreadDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.createThread(dto, userId);
  }

  @Get('threads/:id/messages')
  getMessages(
    @Param('id') threadId: string,
    @CurrentUser('id') userId: string,
    @Query() query: Record<string, string>,
  ) {
    return this.chatService.getMessages(threadId, userId, query);
  }

  @Post('threads/:id/messages')
  sendMessage(
    @Param('id') threadId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.sendMessage(threadId, dto, userId, dto.profile_id);
  }

  @Patch('messages/:id/read')
  markAsRead(
    @Param('id') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.markAsRead(messageId, userId);
  }
}
