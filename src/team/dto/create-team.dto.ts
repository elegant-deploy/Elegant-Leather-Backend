import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsUrl()
  @IsNotEmpty()
  linkedinLink: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
