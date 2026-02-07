import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactUsDocument = ContactUs & Document;

@Schema({ timestamps: true })
export class ContactUs {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  message: string;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);