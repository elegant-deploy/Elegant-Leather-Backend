import { IsString, IsOptional, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsNumber()
    @IsOptional()
    ratings?: number;

    @IsNumber()
    @IsOptional()
    reviewCount?: number;

    @IsString()
    @IsNotEmpty()
    category: string;
}