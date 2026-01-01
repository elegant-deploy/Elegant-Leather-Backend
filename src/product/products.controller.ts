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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('products')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly auditLogsService: AuditLogsService,
    ) { }

    @Post()
    @UseInterceptors(FilesInterceptor('images'))
    async create(
        @Request() req,
        @Body() createProductDto: { title: string; description: string; category: string },
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least one image is required');
        }

        const mainImage = await this.cloudinaryService.uploadImage(files[0]);
        const variants = files.length > 1 ? await this.cloudinaryService.uploadMultipleImages(files.slice(1)) : [];

        const product = await this.productsService.create({
            ...createProductDto,
            mainImage,
            variants,
        });
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'CREATE',
            resource: 'Product',
            newValue: product,
            details: `Created product ${product.title}`,
            ipAddress: req.ip,
        });
        return product;
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get('category/:category')
    findByCategory(@Param('category') category: string) {
        return this.productsService.findByCategory(category);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FilesInterceptor('images'))
    async update(
        @Param('id') id: string,
        @Request() req,
        @Body() updateProductDto: Partial<{ title: string; description: string; category: string }>,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const oldProduct = await this.productsService.findOne(id);
        let updateData: Partial<{
            title: string;
            description: string;
            category: string;
            mainImage: string;
            variants: string[];
        }> = { ...updateProductDto };

        if (files && files.length > 0) {
            const mainImage = await this.cloudinaryService.uploadImage(files[0]);
            const variants = files.length > 1 ? await this.cloudinaryService.uploadMultipleImages(files.slice(1)) : [];
            updateData.mainImage = mainImage;
            updateData.variants = variants;
        }

        const updatedProduct = await this.productsService.update(id, updateData);
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'UPDATE',
            resource: 'Product',
            oldValue: oldProduct,
            newValue: updatedProduct,
            details: `Updated product ${id}`,
            ipAddress: req.ip,
        });
        return updatedProduct;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        const oldProduct = await this.productsService.findOne(id);
        await this.productsService.remove(id);
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'DELETE',
            resource: 'Product',
            oldValue: oldProduct,
            details: `Deleted product ${id}`,
            ipAddress: req.ip,
        });
    }
}