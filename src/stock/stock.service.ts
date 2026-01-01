import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument, StockType } from './schemas/stock.schema';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
  ) {}

  async addStock(createStockDto: { type: StockType; name: string; quantity: number; departmentId: string; addedBy: string; unit?: string }): Promise<Stock> {
    const stock = new this.stockModel(createStockDto);
    return stock.save();
  }

  async findAll(): Promise<Stock[]> {
    return this.stockModel.find().populate('departmentId addedBy').exec();
  }

  async findByDepartment(departmentId: string): Promise<Stock[]> {
    return this.stockModel.find({ departmentId }).populate('addedBy').exec();
  }

  async findByType(type: StockType, departmentId?: string): Promise<Stock[]> {
    const query = { type };
    if (departmentId) query['departmentId'] = departmentId;
    return this.stockModel.find(query).populate('departmentId addedBy').exec();
  }

  async findOne(id: string): Promise<Stock | null> {
    return this.stockModel.findById(id).populate('departmentId addedBy').exec();
  }

  async updateQuantity(id: string, quantity: number): Promise<Stock | null> {
    return this.stockModel.findByIdAndUpdate(id, { quantity }, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.stockModel.findByIdAndDelete(id).exec();
  }
}