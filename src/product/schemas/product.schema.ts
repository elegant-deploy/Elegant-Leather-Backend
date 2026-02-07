import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

interface MediaAsset {
    url: string;
    public_id: string;
}

interface ProductVariant {
    images: MediaAsset[];
}

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true })
    title: string;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ default: 0 })
    ratings: number;

    @Prop({ default: 0 })
    reviewCount: number;

    @Prop({ required: true })
    category: string;

    @Prop({ type: Object, required: true })
    images: {
        main: MediaAsset;
        variants: ProductVariant[];
    };
}

export const ProductSchema = SchemaFactory.createForClass(Product);