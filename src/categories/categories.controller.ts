import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService
    ) { }

    @Post()
    async create(@Body() createCategoryDto: { name: string; description?: string }, @Request() req) {
        const category = await this.categoriesService.create(createCategoryDto);
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
        return updatedCategory;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        const oldCategory = await this.categoriesService.findOne(id);
        await this.categoriesService.remove(id);
    }
}