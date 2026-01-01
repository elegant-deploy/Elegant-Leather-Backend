import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  action: string; // CREATE, UPDATE, DELETE, etc.

  @Prop({ required: true })
  resource: string; // Department, User, Order, Stock, etc.

  @Prop({ type: Object })
  oldValue: any;

  @Prop({ type: Object })
  newValue: any;

  @Prop()
  details: string;

  @Prop()
  ipAddress: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);