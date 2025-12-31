import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    async create(createCategoryDto: { name: string; description?: string }): Promise<Category> {
        const createdCategory = new this.categoryModel(createCategoryDto);
        return createdCategory.save();
    }

    async findAll(): Promise<Category[]> {
        return this.categoryModel.find().exec();
    }

    async findOne(id: string): Promise<Category | null> {
        return this.categoryModel.findById(id).exec();
    }

    async update(id: string, updateCategoryDto: { name?: string; description?: string }): Promise<Category | null> {
        return this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Category | null> {
        return this.categoryModel.findByIdAndDelete(id).exec();
    }
}