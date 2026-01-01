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
import { LeathersService } from './leathers.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('leathers')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class LeathersController {
    constructor(
        private readonly leathersService: LeathersService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly auditLogsService: AuditLogsService,
    ) { }

    @Post()
    @UseInterceptors(FilesInterceptor('images'))
    async create(
        @Request() req,
        @Body() createLeatherDto: { title: string; description: string; category: string },
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least one image is required');
        }

        const mainImage = await this.cloudinaryService.uploadImage(files[0]);
        const variants = files.length > 1 ? await this.cloudinaryService.uploadMultipleImages(files.slice(1)) : [];

        const leather = await this.leathersService.create({
            ...createLeatherDto,
            mainImage,
            variants,
        });
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'CREATE',
            resource: 'Leather',
            newValue: leather,
            details: `Created leather ${leather.title}`,
            ipAddress: req.ip,
        });
        return leather;
    }

    @Get()
    findAll() {
        return this.leathersService.findAll();
    }

    @Get('category/:category')
    findByCategory(@Param('category') category: string) {
        return this.leathersService.findByCategory(category);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leathersService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FilesInterceptor('images'))
    async update(
        @Param('id') id: string,
        @Request() req,
        @Body() updateLeatherDto: Partial<{ title: string; description: string; category: string }>,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const oldLeather = await this.leathersService.findOne(id);
        let updateData: Partial<{
            title: string;
            description: string;
            category: string;
            mainImage: string;
            variants: string[];
        }> = { ...updateLeatherDto };

        if (files && files.length > 0) {
            const mainImage = await this.cloudinaryService.uploadImage(files[0]);
            const variants = files.length > 1 ? await this.cloudinaryService.uploadMultipleImages(files.slice(1)) : [];
            updateData.mainImage = mainImage;
            updateData.variants = variants;
        }

        const updatedLeather = await this.leathersService.update(id, updateData);
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'UPDATE',
            resource: 'Leather',
            oldValue: oldLeather,
            newValue: updatedLeather,
            details: `Updated leather ${id}`,
            ipAddress: req.ip,
        });
        return updatedLeather;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        const oldLeather = await this.leathersService.findOne(id);
        await this.leathersService.remove(id);
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'DELETE',
            resource: 'Leather',
            oldValue: oldLeather,
            details: `Deleted leather ${id}`,
            ipAddress: req.ip,
        });
    }
}