import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
    departmentId?: string;
  }): Promise<User> {
    const { email, password, firstName, lastName, username, role, departmentId } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
      role,
      departmentId,
    });

    const savedUser = await newUser.save();
    console.log('User created:', savedUser._id);

    // If this is a department admin, update the department's assignedTo field
    if (role === 'DEPT_ADMIN' && departmentId) {
      // await this.departmentModel.findByIdAndUpdate(departmentId, { assignedTo: savedUser._id });
    }

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updateProfile(id: string, updateData: { name: string; email: string; phone?: string; address?: string }): Promise<User> {
    const [firstName, ...lastNameParts] = updateData.name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const updateObj = {
      firstName,
      lastName,
      email: updateData.email,
      phone: updateData.phone,
      address: updateData.address,
    };

    const user = await this.userModel.findByIdAndUpdate(id, updateObj, { new: true });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.validatePassword(user, currentPassword);
    if (!isValid) {
      throw new ConflictException('Current password is incorrect');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.userModel.findByIdAndUpdate(id, { password: hashedPassword });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() });
  }
} 