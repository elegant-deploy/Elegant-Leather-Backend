import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

export class Message {
  @Prop({ required: true, enum: ['user', 'bot'] })
  sender: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  sentAt: Date;

  _id?: string;
}

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [Message], default: [] })
  messages: Message[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);