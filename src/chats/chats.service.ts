import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { ChatsGateway } from './chats.gateway';

@Injectable()
export class ChatsService {
  private pythonAgentUrl: string;

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @Inject(forwardRef(() => ChatsGateway)) private readonly chatsGateway: ChatsGateway,
  ) {
    this.pythonAgentUrl = process.env.PYTHON_AGENT_SERVER_URI || 'http://localhost:8000';
  }

  async createChat(question: string, userId: string): Promise<{ chatId: string; messageId: string }> {
    try {
      // Call FastAPI without context for new chat
      const response = await fetch(`${this.pythonAgentUrl}/legal/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to call FastAPI');
      }

      const data = await response.json();
      const botResponse = data.data.result;

      // Generate title from first message
      const title = question.length > 50 ? question.substring(0, 50) + '...' : question;

      // Create new chat
      const chat = new this.chatModel({
        userId,
        title,
        messages: [
          {
            sender: 'user',
            text: question,
            sentAt: new Date(),
          },
          {
            sender: 'bot',
            text: botResponse,
            sentAt: new Date(),
          },
        ],
      });

      const savedChat = await chat.save();

      // Emit socket event for real-time updates
      this.chatsGateway.emitNewMessage((savedChat._id as any).toString(), {
        sender: 'bot',
        text: botResponse,
        sentAt: new Date(),
      });

      return {
        chatId: (savedChat._id as any).toString(),
        messageId: 'message-id',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addMessage(chatId: string, question: string, userId: string): Promise<{ messageId: string }> {
    try {
      // Get existing chat and verify ownership
      const chat = await this.chatModel.findOne({ _id: chatId, userId });
      if (!chat) {
        throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
      }

      // Prepare context from existing messages
      const context = chat.messages.map(msg => ({
        sender: msg.sender,
        text: msg.text,
        sentAt: msg.sentAt.toISOString(),
      }));

      // Call FastAPI with context
      const response = await fetch(`${this.pythonAgentUrl}/legal/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to call FastAPI');
      }

      const data = await response.json();
      const botResponse = data.data.result;

      // Add new messages
      chat.messages.push(
        {
          sender: 'user',
          text: question,
          sentAt: new Date(),
        },
        {
          sender: 'bot',
          text: botResponse,
          sentAt: new Date(),
        }
      );

      await chat.save();

      // Emit socket event for real-time updates
      this.chatsGateway.emitNewMessage(chatId, {
        sender: 'bot',
        text: botResponse,
        sentAt: new Date(),
      });

      return {
        messageId: 'message-id',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to add message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getChats(userId: string): Promise<{ chatId: string; title: string; createdAt: Date }[]> {
    const chats = await this.chatModel.find({ userId }, 'title createdAt').sort({ createdAt: -1 });
    return chats.map(chat => ({
      chatId: (chat._id as any).toString(),
      title: chat.title,
      createdAt: (chat as any).createdAt,
    }));
  }

  async getChat(chatId: string, userId: string): Promise<{ chatId: string; title: string; messages: any[] }> {
    const chat = await this.chatModel.findOne({ _id: chatId, userId });
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    return {
      chatId: (chat._id as any).toString(),
      title: chat.title,
      messages: chat.messages,
    };
  }

  async getChatMessages(chatId: string): Promise<any[]> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    return chat.messages;
  }

  async saveMessages(chatId: string, userId: string, userMessage: string, botMessage: string): Promise<void> {
    const chat = await this.chatModel.findOne({ _id: chatId, userId });
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    chat.messages.push(
      {
        sender: 'user',
        text: userMessage,
        sentAt: new Date(),
      },
      {
        sender: 'bot',
        text: botMessage,
        sentAt: new Date(),
      }
    );

    await chat.save();
  }

  async createChatWithMessages(question: string, answer: string, userId: string): Promise<string> {
    const title = question.length > 50 ? question.substring(0, 50) + '...' : question;

    const chat = new this.chatModel({
      userId,
      title,
      messages: [
        {
          sender: 'user',
          text: question,
          sentAt: new Date(),
        },
        {
          sender: 'bot',
          text: answer,
          sentAt: new Date(),
        },
      ],
    });

    const savedChat = await chat.save();
    return (savedChat._id as any).toString();
  }
}