import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeatherDocument = Leather & Document;

interface MediaAsset {
    url: string;
    public_id: string;
}

interface VariantMedia {
    images: MediaAsset[];
    videos: MediaAsset[];
}

interface MediaSection {
    main?: MediaAsset;
    variants: VariantMedia[];
}

@Schema({ timestamps: true })
export class Leather {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    category: string;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ type: Object, required: true })
    media: {
        images: MediaSection;
        videos: MediaSection;
    };
}

export const LeatherSchema = SchemaFactory.createForClass(Leather);