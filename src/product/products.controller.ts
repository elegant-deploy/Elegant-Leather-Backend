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
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    // Helper: group files by fieldname
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
        @Body() createProductDto: CreateProductDto,
        @UploadedFiles() uploadedFiles: Express.Multer.File[],
    ) {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const files = this.groupFiles(uploadedFiles);

        const images = {
            main: null as any,
            variants: [] as { images: any[] }[],
        };

        /* =========================
           MAIN IMAGE (REQUIRED)
        ========================== */
        const mainImageFiles = files['images_main'];
        if (!mainImageFiles || mainImageFiles.length === 0) {
            throw new BadRequestException('Main image is required');
        }

        images.main = await this.cloudinaryService.uploadImage(
            mainImageFiles[0],
        );

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

                if (!images.variants[idx]) {
                    images.variants[idx] = { images: [] };
                }

                images.variants[idx].images =
                    await this.cloudinaryService.uploadMultipleImages(files[fieldname]);
            }
        }

        /* =========================
           NORMALIZE VARIANTS
        ========================== */
        const maxIndex =
            variantIndices.size > 0 ? Math.max(...variantIndices) : -1;

        for (let i = 0; i <= maxIndex; i++) {
            if (!images.variants[i]) {
                images.variants[i] = { images: [] };
            }
        }

        /* =========================
           SAVE PRODUCT
        ========================== */
        return this.productsService.create({
            ...createProductDto,
            images,
        });
    }

    /* =========================
       READ APIs
    ========================== */
    @Get()
    async findAll() {
        const [products, count] = await Promise.all([
            this.productsService.findAll(),
            this.productsService.count(),
        ]);
        return { count, data: products };
    }

    @Get('category/:category')
    findByCategory(@Param('category') category: string) {
        return this.productsService.findByCategory(category);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    /* =========================
       UPDATE
    ========================== */
    @Patch(':id')
    @UseInterceptors(AnyFilesInterceptor())
    async update(
        @Param('id') id: string,
        @Body()
        updateProductDto: Partial<{
            title: string;
            tags?: string[];
            category: string;
            images?: any;
        }>,
        @UploadedFiles() uploadedFiles?: Express.Multer.File[],
    ) {
        const product = await this.productsService.findOne(id);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        type ImagesType = {
            main?: any;
            variants: Array<{ images: any[] }>;
        };

        let images: ImagesType = (product.images || {
            main: null,
            variants: [],
        }) as ImagesType;

        if (uploadedFiles && uploadedFiles.length > 0) {
            const files = this.groupFiles(uploadedFiles);

            // Update main image if provided
            if (files['images_main'] && files['images_main'].length > 0) {
                if (images.main) {
                    await this.cloudinaryService.deleteAsset(images.main.public_id);
                }
                images.main = await this.cloudinaryService.uploadImage(
                    files['images_main'][0],
                );
            }

            // Check if any variant files provided
            const hasVariantFiles = Object.keys(files).some((key) =>
                key.match(/^images_variants_\d+_images$/),
            );

            if (hasVariantFiles) {
                // Delete old variants
                const deletePromises: Promise<any>[] = [];
                images.variants?.forEach((variant) => {
                    variant.images?.forEach((img) =>
                        deletePromises.push(this.cloudinaryService.deleteAsset(img.public_id)),
                    );
                });
                if (deletePromises.length > 0) {
                    await Promise.allSettled(deletePromises);
                }

                // Upload new variants
                images.variants = [];

                const variantIndices = new Set<number>();

                for (const fieldname of Object.keys(files)) {
                    let match: RegExpMatchArray | null;

                    match = fieldname.match(/^images_variants_(\d+)_images$/);
                    if (match) {
                        const idx = Number(match[1]);
                        variantIndices.add(idx);

                        if (!images.variants[idx]) {
                            images.variants[idx] = { images: [] };
                        }

                        images.variants[idx].images =
                            await this.cloudinaryService.uploadMultipleImages(files[fieldname]);
                    }
                }

                // Normalize variants
                const maxIndex =
                    variantIndices.size > 0 ? Math.max(...variantIndices) : -1;

                for (let i = 0; i <= maxIndex; i++) {
                    if (!images.variants[i]) {
                        images.variants[i] = { images: [] };
                    }
                }
            }
        }

        // Update the document
        const updateData = { ...updateProductDto };
        if (uploadedFiles && uploadedFiles.length > 0) {
            updateData.images = images;
        }

        return this.productsService.update(id, updateData);
    }

    /* =========================
       DELETE
    ========================== */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const product = await this.productsService.findOne(id);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Delete images from Cloudinary
        const deletePromises: Promise<any>[] = [];

        if (product.images?.main) {
            deletePromises.push(
                this.cloudinaryService.deleteAsset(product.images.main.public_id),
            );
        }

        product.images?.variants?.forEach((variant) => {
            variant.images?.forEach((img) =>
                deletePromises.push(this.cloudinaryService.deleteAsset(img.public_id)),
            );
        });

        // Delete assets (ignore errors if any)
        if (deletePromises.length > 0) {
            await Promise.allSettled(deletePromises);
        }

        // Delete from DB
        await this.productsService.remove(id);
        return { message: 'Product deleted successfully' };
    }
}