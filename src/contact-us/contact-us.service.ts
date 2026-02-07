import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactUs, ContactUsDocument } from './schemas/contact-us.schema';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectModel(ContactUs.name) private contactUsModel: Model<ContactUsDocument>,
  ) {}

  async create(createContactUsDto: {
    name: string;
    lastname: string;
    email: string;
    message: string;
  }): Promise<ContactUs> {
    const createdContact = new this.contactUsModel(createContactUsDto);
    return createdContact.save();
  }

  async findAll(): Promise<ContactUs[]> {
    return this.contactUsModel.find().sort({ createdAt: -1 }).exec();
  }
}