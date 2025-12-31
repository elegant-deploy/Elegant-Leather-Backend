import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leather, LeatherDocument } from './schemas/leather.schema';

@Injectable()
export class LeathersService {
    constructor(
        @InjectModel(Leather.name) private leatherModel: Model<LeatherDocument>,
    ) { }

    async create(createLeatherDto: {
        title: string;
        description: string;
        category: string;
        mainImage: string;
        variants?: string[];
    }): Promise<Leather> {
        const createdLeather = new this.leatherModel(createLeatherDto);
        return createdLeather.save();
    }

    async findAll(): Promise<Leather[]> {
        return this.leatherModel.find().exec();
    }

    async findByCategory(category: string): Promise<Leather[]> {
        return this.leatherModel.find({ category }).exec();
    }

    async findOne(id: string): Promise<Leather | null> {
        return this.leatherModel.findById(id).exec();
    }

    async update(id: string, updateLeatherDto: Partial<{
        title: string;
        description: string;
        category: string;
        mainImage: string;
        variants: string[];
    }>): Promise<Leather | null> {
        return this.leatherModel.findByIdAndUpdate(id, updateLeatherDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Leather | null> {
        return this.leatherModel.findByIdAndDelete(id).exec();
    }
}