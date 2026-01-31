import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateLeatherDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}