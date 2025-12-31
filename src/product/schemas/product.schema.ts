import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, type: String })
    category: string; // category name or id?

    @Prop({ required: true })
    mainImage: string; // cloudinary public url

    @Prop({ type: [String], default: [] })
    variants: string[]; // array of cloudinary public urls
}

export const ProductSchema = SchemaFactory.createForClass(Product);