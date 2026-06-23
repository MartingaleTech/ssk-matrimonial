import { IsString, IsOptional } from 'class-validator';

export class UpdateEducationCareerDto {
  @IsString()
  @IsOptional()
  highest_education?: string;

  @IsString()
  @IsOptional()
  education_details?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  company_name?: string;

  @IsString()
  @IsOptional()
  annual_income_range?: string;

  @IsString()
  @IsOptional()
  work_location_city?: string;

  @IsString()
  @IsOptional()
  work_location_country?: string;
}
