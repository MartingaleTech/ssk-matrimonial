import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import {
  ChatThread,
  ChatMessage,
  ProfileManager,
  Block,
  Connection,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatThread,
      ChatMessage,
      ProfileManager,
      Block,
      Connection,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
