import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { LeathersService } from './leathers.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CreateLeatherDto } from './dto/create-leather.dto';

@Controller('leathers')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class LeathersController {
  constructor(
    private readonly leathersService: LeathersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ✅ Helper: group files by fieldname
  private groupFiles(files: Express.Multer.File[]) {
    return files.reduce((acc, file) => {
      if (!acc[file.fieldname]) acc[file.fieldname] = [];
      acc[file.fieldname].push(file);
      return acc;
    }, {} as Record<string, Express.Multer.File[]>);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Request() req,
    @Body() createLeatherDto: CreateLeatherDto,
    @UploadedFiles() uploadedFiles: Express.Multer.File[],
  ) {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const files = this.groupFiles(uploadedFiles);

    const media = {
      images: {
        main: null as any,
        variants: [] as { images: any[]; videos: any[] }[],
      },
      videos: {
        main: null as any,
        variants: [] as { videos: any[] }[],
      },
    };

    /* =========================
       MAIN IMAGE (REQUIRED)
    ========================== */
    const mainImageFiles = files['images_main'];
    if (!mainImageFiles || mainImageFiles.length === 0) {
      throw new BadRequestException('Main image is required');
    }

    media.images.main = await this.cloudinaryService.uploadImage(
      mainImageFiles[0],
    );

    /* =========================
       MAIN VIDEO (OPTIONAL)
    ========================== */
    const mainVideoFiles = files['videos_main'];
    if (mainVideoFiles && mainVideoFiles.length > 0) {
      media.videos.main = await this.cloudinaryService.uploadVideo(
        mainVideoFiles[0],
      );
    }

    /* =========================
       VARIANTS (DYNAMIC)
    ========================== */
    const variantIndices = new Set<number>();

    for (const fieldname of Object.keys(files)) {
      let match: RegExpMatchArray | null;

      // images_variants_{i}_images
      match = fieldname.match(/^images_variants_(\d+)_images$/);
      if (match) {
        const idx = Number(match[1]);
        variantIndices.add(idx);

        if (!media.images.variants[idx]) {
          media.images.variants[idx] = { images: [], videos: [] };
        }

        media.images.variants[idx].images =
          await this.cloudinaryService.uploadMultipleImages(files[fieldname]);
      }

      // images_variants_{i}_videos
      match = fieldname.match(/^images_variants_(\d+)_videos$/);
      if (match) {
        const idx = Number(match[1]);
        variantIndices.add(idx);

        if (!media.images.variants[idx]) {
          media.images.variants[idx] = { images: [], videos: [] };
        }

        media.images.variants[idx].videos =
          await this.cloudinaryService.uploadMultipleVideos(files[fieldname]);
      }

      // videos_variants_{i}_videos
      match = fieldname.match(/^videos_variants_(\d+)_videos$/);
      if (match) {
        const idx = Number(match[1]);
        variantIndices.add(idx);

        if (!media.videos.variants[idx]) {
          media.videos.variants[idx] = { videos: [] };
        }

        media.videos.variants[idx].videos =
          await this.cloudinaryService.uploadMultipleVideos(files[fieldname]);
      }
    }

    /* =========================
       NORMALIZE VARIANTS
    ========================== */
    const maxIndex =
      variantIndices.size > 0 ? Math.max(...variantIndices) : -1;

    for (let i = 0; i <= maxIndex; i++) {
      if (!media.images.variants[i]) {
        media.images.variants[i] = { images: [], videos: [] };
      }
      if (!media.videos.variants[i]) {
        media.videos.variants[i] = { videos: [] };
      }
    }

    /* =========================
       SAVE LEATHER
    ========================== */
    return this.leathersService.create({
      ...createLeatherDto,
      media,
    });
  }

  /* =========================
     READ APIs
  ========================== */
  @Get()
  async findAll() {
    const [leathers, count] = await Promise.all([
      this.leathersService.findAll(),
      this.leathersService.count(),
    ]);
    return { count, data: leathers };
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.leathersService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leathersService.findOne(id);
  }

  /* =========================
     UPDATE
  ========================== */
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: string,
    @Body()
    updateLeatherDto: Partial<{
      name: string;
      description: string;
      category: string;
      tags: string[];
      media?: any;
    }>,
    @UploadedFiles() uploadedFiles?: Express.Multer.File[],
  ) {
    const leather = await this.leathersService.findOne(id);
    if (!leather) {
      throw new NotFoundException('Leather not found');
    }

    type MediaType = {
      images: {
        main?: any;
        variants: Array<{ images: any[]; videos: any[] }>;
      };
      videos: {
        main?: any;
        variants: Array<{ videos: any[] }>;
      };
    };

    let media: MediaType = (leather.media || {
      images: { main: null, variants: [] },
      videos: { main: null, variants: [] },
    }) as MediaType;

    if (uploadedFiles && uploadedFiles.length > 0) {
      const files = this.groupFiles(uploadedFiles);

      // Update main image if provided
      if (files['images_main'] && files['images_main'].length > 0) {
        if (media.images?.main) {
          await this.cloudinaryService.deleteAsset(media.images.main.public_id);
        }
        media.images.main = await this.cloudinaryService.uploadImage(
          files['images_main'][0],
        );
      }

      // Update main video if provided
      if (files['videos_main'] && files['videos_main'].length > 0) {
        if (media.videos?.main) {
          await this.cloudinaryService.deleteAsset(media.videos.main.public_id);
        }
        media.videos.main = await this.cloudinaryService.uploadVideo(
          files['videos_main'][0],
        );
      }

      // Check if any variant files provided
      const hasVariantFiles = Object.keys(files).some(
        (key) =>
          key.match(/^images_variants_\d+_images$/) ||
          key.match(/^images_variants_\d+_videos$/) ||
          key.match(/^videos_variants_\d+_videos$/),
      );

      if (hasVariantFiles) {
        // Delete old variants
        const deletePromises: Promise<any>[] = [];
        media.images?.variants?.forEach((variant) => {
          variant.images?.forEach((img) =>
            deletePromises.push(this.cloudinaryService.deleteAsset(img.public_id)),
          );
          variant.videos?.forEach((vid) =>
            deletePromises.push(this.cloudinaryService.deleteAsset(vid.public_id)),
          );
        });
        media.videos?.variants?.forEach((variant) => {
          variant.videos?.forEach((vid) =>
            deletePromises.push(this.cloudinaryService.deleteAsset(vid.public_id)),
          );
        });
        if (deletePromises.length > 0) {
          await Promise.allSettled(deletePromises);
        }

        // Upload new variants
        media.images.variants = [];
        media.videos.variants = [];

        const variantIndices = new Set<number>();

        for (const fieldname of Object.keys(files)) {
          let match: RegExpMatchArray | null;

          match = fieldname.match(/^images_variants_(\d+)_images$/);
          if (match) {
            const idx = Number(match[1]);
            variantIndices.add(idx);

            if (!media.images.variants[idx]) {
              media.images.variants[idx] = { images: [], videos: [] };
            }

            media.images.variants[idx].images =
              await this.cloudinaryService.uploadMultipleImages(files[fieldname]);
          }

          match = fieldname.match(/^images_variants_(\d+)_videos$/);
          if (match) {
            const idx = Number(match[1]);
            variantIndices.add(idx);

            if (!media.images.variants[idx]) {
              media.images.variants[idx] = { images: [], videos: [] };
            }

            media.images.variants[idx].videos =
              await this.cloudinaryService.uploadMultipleVideos(files[fieldname]);
          }

          match = fieldname.match(/^videos_variants_(\d+)_videos$/);
          if (match) {
            const idx = Number(match[1]);
            variantIndices.add(idx);

            if (!media.videos.variants[idx]) {
              media.videos.variants[idx] = { videos: [] };
            }

            media.videos.variants[idx].videos =
              await this.cloudinaryService.uploadMultipleVideos(files[fieldname]);
          }
        }

        // Normalize variants
        const maxIndex =
          variantIndices.size > 0 ? Math.max(...variantIndices) : -1;

        for (let i = 0; i <= maxIndex; i++) {
          if (!media.images.variants[i]) {
            media.images.variants[i] = { images: [], videos: [] };
          }
          if (!media.videos.variants[i]) {
            media.videos.variants[i] = { videos: [] };
          }
        }
      }
    }

    // Update the document
    const updateData = { ...updateLeatherDto };
    if (uploadedFiles && uploadedFiles.length > 0) {
      updateData.media = media;
    }

    return this.leathersService.update(id, updateData);
  }

  /* =========================
     DELETE
  ========================== */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const leather = await this.leathersService.findOne(id);
    if (!leather) {
      throw new NotFoundException('Leather not found');
    }

    // Delete media from Cloudinary
    const deletePromises: Promise<any>[] = [];

    if (leather.media?.images?.main) {
      deletePromises.push(
        this.cloudinaryService.deleteAsset(leather.media.images.main.public_id),
      );
    }

    leather.media?.images?.variants?.forEach((variant) => {
      variant.images?.forEach((img) =>
        deletePromises.push(this.cloudinaryService.deleteAsset(img.public_id)),
      );
      variant.videos?.forEach((vid) =>
        deletePromises.push(this.cloudinaryService.deleteAsset(vid.public_id)),
      );
    });

    if (leather.media?.videos?.main) {
      deletePromises.push(
        this.cloudinaryService.deleteAsset(leather.media.videos.main.public_id),
      );
    }

    leather.media?.videos?.variants?.forEach((variant) => {
      variant.videos?.forEach((vid) =>
        deletePromises.push(this.cloudinaryService.deleteAsset(vid.public_id)),
      );
    });

    // Delete assets (ignore errors if any)
    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }

    // Delete from DB
    await this.leathersService.remove(id);
    return { message: 'Leather deleted successfully' };
  }
}
