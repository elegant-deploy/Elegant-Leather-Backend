import { IsString, IsOptional, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateLeatherDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    inStock?: number;

    @IsNumber()
    @IsOptional()
    ratings?: number;

    @IsNumber()
    @IsOptional()
    reviewCount?: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}