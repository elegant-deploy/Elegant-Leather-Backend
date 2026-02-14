import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  linkedinLink: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  imagePublicId: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
