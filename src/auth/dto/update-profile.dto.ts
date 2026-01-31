import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    name: string; // Will split into firstName lastName

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;
}