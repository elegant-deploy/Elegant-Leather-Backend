import { Controller, Post, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor({
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  }))
  async uploadMedia(@UploadedFiles() uploadedFiles: Express.Multer.File[]) {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const files = uploadedFiles.reduce((acc, file) => {
      if (!acc[file.fieldname]) acc[file.fieldname] = [];
      acc[file.fieldname].push(file);
      return acc;
    }, {} as Record<string, Express.Multer.File[]>);

    const result = { images: [] as string[], videos: [] as string[] };

    // Upload images
    if (files['images']) {
      const imageUrls = await this.cloudinaryService.uploadMultipleImagesUrls(files['images']);
      result.images = imageUrls;
    }

    // Upload videos
    if (files['videos']) {
      const videoUrls = await Promise.all(
        files['videos'].map(async (file) => {
          const uploaded = await this.cloudinaryService.uploadVideo(file);
          return uploaded.url;
        })
      );
      result.videos = videoUrls;
    }

    return result;
  }
}