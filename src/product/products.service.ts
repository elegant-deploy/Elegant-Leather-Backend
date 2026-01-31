import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async create(createProductDto: {
        title: string;
        tags?: string[];
        category: string;
        images: any;
    }): Promise<Product> {
        const createdProduct = new this.productModel(createProductDto);
        return createdProduct.save();
    }

    async findAll(): Promise<Product[]> {
        return this.productModel.find().exec();
    }

    async count(): Promise<number> {
        return this.productModel.countDocuments().exec();
    }

    async findByCategory(category: string): Promise<Product[]> {
        return this.productModel.find({ category }).exec();
    }

    async findOne(id: string): Promise<Product | null> {
        return this.productModel.findById(id).exec();
    }

    async update(id: string, updateProductDto: Partial<{
        title: string;
        tags?: string[];
        category: string;
        images: any;
    }>): Promise<Product | null> {
        return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Product | null> {
        return this.productModel.findByIdAndDelete(id).exec();
    }
}