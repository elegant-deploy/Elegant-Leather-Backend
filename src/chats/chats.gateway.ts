import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpService } from '@nestjs/axios';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ChatsService } from './chats.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatsGateway {
  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => ChatsService)) private readonly chatsService: ChatsService,
  ) {}

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

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: { chatId: string; message: any; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, message, userId } = data;

    // Emit the user message immediately
    this.server.to(chatId).emit('new-message-response', {
      chatId,
      message: {
        id: message.id || Date.now().toString(),
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp,
        userId: message.userId,
      },
    });

    try {
      let isNewChat = false;
      let conversationHistory: any = [];

      try {
        conversationHistory = await this.chatsService.getChatMessages(chatId);
      } catch (error: any) {
        if (error.status === 404 || error.name === 'CastError') {
          isNewChat = true;
          conversationHistory = [];
        } else {
          throw error;
        }
      }

      // Build context, filtering out error messages
      const context = conversationHistory
        .filter((msg: any) => !msg.error)
        .map((msg: any) => ({
          sender: msg.sender,
          text: msg.text || msg.content,
          sentAt: msg.sentAt || msg.timestamp,
        }));

      // Call AI agent
      const aiResponse = await this.queryAIAgent(message.content, context);
      const safeAiResponse = typeof aiResponse === 'string' ? aiResponse : 'No response from AI agent';

      if (isNewChat) {
        // Create new chat with messages
        const realChatId = await this.chatsService.createChatWithMessages(message.content, safeAiResponse, userId);

        // Emit chat created event
        this.server.to(chatId).emit('chat-created', {
          tempChatId: chatId,
          realChatId,
        });

        // Emit AI response with real chatId
        this.server.to(realChatId).emit('new-message-response', {
          chatId: realChatId,
          message: {
            id: (Date.now() + 1).toString(),
            content: safeAiResponse,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            userId: 'ai-agent',
          },
        });

        // Make client join the real chat room
        client.join(realChatId);
      } else {
        // Existing chat, save messages
        await this.chatsService.saveMessages(chatId, userId, message.content, safeAiResponse);

        // Emit AI response
        this.server.to(chatId).emit('new-message-response', {
          chatId,
          message: {
            id: (Date.now() + 1).toString(),
            content: safeAiResponse,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            userId: 'ai-agent',
          },
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);

      // Emit error message
      this.server.to(chatId).emit('new-message-response', {
        chatId,
        message: {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error processing your request.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          userId: 'ai-agent',
          error: true,
        },
      });
    }
  }

  private async queryAIAgent(question: string, context: any): Promise<string> {
    const aiAgentUrl = process.env.PYTHON_AGENT_SERVER_URI || 'http://localhost:8000';

    try {
      const payload: any = { question };
      if (context && context.length > 0) {
        payload.context = context;
      }

      console.log('Sending payload to AI agent:', JSON.stringify(payload, null, 2));

      const response = await firstValueFrom(
        this.httpService.post(`${aiAgentUrl}/legal/ask`, payload)
      );

      console.log('AI agent response:', response.data);

      return response.data.result || response.data.data?.result || response.data.answer || response.data.response || 'No response from AI agent';
    } catch (error) {
      console.error('AI Agent request failed:', error);
      throw error;
    }
  }

  emitNewMessage(chatId: string, message: any) {
    this.server.to(chatId).emit('new-message-response', {
      chatId,
      message,
    });
  }
}