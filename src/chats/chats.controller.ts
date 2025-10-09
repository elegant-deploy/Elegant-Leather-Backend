import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Request() req) {
    return this.chatsService.createChat(createChatDto.question, req.user.userId);
  }

  @Post(':chatId/messages')
  async addMessage(
    @Param('chatId') chatId: string,
    @Body() addMessageDto: AddMessageDto,
    @Request() req,
  ) {
    return this.chatsService.addMessage(chatId, addMessageDto.question, req.user.userId);
  }

  @Get()
  async getChats(@Request() req) {
    return this.chatsService.getChats(req.user.userId);
  }

  @Get(':chatId')
  async getChat(@Param('chatId') chatId: string, @Request() req) {
    return this.chatsService.getChat(chatId, req.user.userId);
  }
}