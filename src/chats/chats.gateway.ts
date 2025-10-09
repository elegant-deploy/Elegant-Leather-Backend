import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-chat')
  handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.chatId);
    return { event: 'joined', data: { chatId: data.chatId } };
  }

  emitNewMessage(chatId: string, message: any) {
    this.server.to(chatId).emit('new-message-response', {
      chatId,
      message,
    });
  }
}