import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateContactUsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}