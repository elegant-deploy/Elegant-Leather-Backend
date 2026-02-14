import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createTeamDto: CreateTeamDto,
    imageFile: Express.Multer.File,
  ): Promise<Team> {
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    // Upload image to Cloudinary
    const uploadedAsset = await this.cloudinaryService.uploadImage(imageFile);

    // Create team member with image URL and public_id
    const team = new this.teamModel({
      ...createTeamDto,
      imageUrl: uploadedAsset.url,
      imagePublicId: uploadedAsset.public_id,
    });

    return team.save();
  }

  async findAll(): Promise<Team[]> {
    return this.teamModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel.findById(id).exec();
    if (!team) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    return team;
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
    imageFile?: Express.Multer.File,
  ): Promise<Team | null> {
    const team = await this.findOne(id);

    let updateData: any = { ...updateTeamDto };

    // If new image is provided, delete old one and upload new one
    if (imageFile) {
      // Delete old image from Cloudinary
      if (team.imagePublicId) {
        await this.cloudinaryService.deleteAsset(team.imagePublicId);
      }

      // Upload new image
      const uploadedAsset = await this.cloudinaryService.uploadImage(imageFile);
      updateData.imageUrl = uploadedAsset.url;
      updateData.imagePublicId = uploadedAsset.public_id;
    }

    return this.teamModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Team | null> {
    const team = await this.findOne(id);

    // Delete image from Cloudinary
    if (team.imagePublicId) {
      await this.cloudinaryService.deleteAsset(team.imagePublicId);
    }

    // Soft delete: mark as inactive
    return this.teamModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
  }

  async hardDelete(id: string): Promise<Team | null> {
    const team = await this.findOne(id);

    // Delete image from Cloudinary
    if (team.imagePublicId) {
      await this.cloudinaryService.deleteAsset(team.imagePublicId);
    }

    // Hard delete
    return this.teamModel.findByIdAndDelete(id).exec();
  }

  async count(): Promise<number> {
    return this.teamModel.countDocuments({ isActive: true }).exec();
  }
}
