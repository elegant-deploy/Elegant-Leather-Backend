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
        name: string;
        description?: string;
        category: string;
        tags?: string[];
        media: any;
    }): Promise<Leather> {
        const createdLeather = new this.leatherModel(createLeatherDto);
        return createdLeather.save();
    }

    async count(): Promise<number> {
        return this.leatherModel.countDocuments().exec();
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
        name: string;
        description?: string;
        category: string;
        tags?: string[];
        media: any;
    }>): Promise<Leather | null> {
        return this.leatherModel.findByIdAndUpdate(id, updateLeatherDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Leather | null> {
        return this.leatherModel.findByIdAndDelete(id).exec();
    }
}