import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  display_name: string;

  @IsString()
  gender: string;

  @IsDateString()
  date_of_birth: string;

  @IsInt()
  @IsOptional()
  height_cm?: number;

  @IsString()
  marital_status: string;

  @IsString()
  @IsOptional()
  about_me?: string;
}
