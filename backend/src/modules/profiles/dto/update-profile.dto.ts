import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  display_name?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @IsInt()
  @IsOptional()
  height_cm?: number;

  @IsString()
  @IsOptional()
  marital_status?: string;

  @IsString()
  @IsOptional()
  about_me?: string;

  @IsString()
  @IsOptional()
  profile_status?: string;
}
