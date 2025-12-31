import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeatherDocument = Leather & Document;

@Schema({ timestamps: true })
export class Leather {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, type: String })
    category: string;

    @Prop({ required: true })
    mainImage: string; // cloudinary public url

    @Prop({ type: [String], default: [] })
    variants: string[]; // array of cloudinary public urls
}

export const LeatherSchema = SchemaFactory.createForClass(Leather);