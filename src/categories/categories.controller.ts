import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('categories')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly auditLogsService: AuditLogsService,
    ) { }

    @Post()
    async create(@Body() createCategoryDto: { name: string; description?: string }, @Request() req) {
        const category = await this.categoriesService.create(createCategoryDto);
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'CREATE',
            resource: 'Category',
            newValue: category,
            details: `Created category ${category.name}`,
            ipAddress: req.ip,
        });
        return category;
    }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateCategoryDto: { name?: string; description?: string }, @Request() req) {
        const oldCategory = await this.categoriesService.findOne(id);
        const updatedCategory = await this.categoriesService.update(id, updateCategoryDto);
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'UPDATE',
            resource: 'Category',
            oldValue: oldCategory,
            newValue: updatedCategory,
            details: `Updated category ${id}`,
            ipAddress: req.ip,
        });
        return updatedCategory;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        const oldCategory = await this.categoriesService.findOne(id);
        await this.categoriesService.remove(id);
        await this.auditLogsService.logAction({
            userId: req.user.userId,
            action: 'DELETE',
            resource: 'Category',
            oldValue: oldCategory,
            details: `Deleted category ${id}`,
            ipAddress: req.ip,
        });
    }
}