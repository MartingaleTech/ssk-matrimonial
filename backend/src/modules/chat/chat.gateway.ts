import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('joinThread')
  handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    client.join(`thread:${data.threadId}`);
    return { event: 'joinedThread', data: { threadId: data.threadId } };
  }

  @SubscribeMessage('leaveThread')
  handleLeaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    client.leave(`thread:${data.threadId}`);
    return { event: 'leftThread', data: { threadId: data.threadId } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      threadId: string;
      content: string;
      message_type?: string;
      userId: string;
      profileId: string;
    },
  ) {
    const message = await this.chatService.sendMessage(
      data.threadId,
      { content: data.content, message_type: data.message_type },
      data.userId,
      data.profileId,
    );

    this.server.to(`thread:${data.threadId}`).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string; profileId: string },
  ) {
    client.to(`thread:${data.threadId}`).emit('userTyping', {
      profileId: data.profileId,
    });
  }
}
