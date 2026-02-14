import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsUrl()
  @IsOptional()
  linkedinLink?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
