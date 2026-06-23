import {
  IsInt,
  IsOptional,
  IsArray,
  IsString,
  IsObject,
} from 'class-validator';

export class UpdatePreferencesDto {
  @IsInt()
  @IsOptional()
  age_min?: number;

  @IsInt()
  @IsOptional()
  age_max?: number;

  @IsInt()
  @IsOptional()
  height_min_cm?: number;

  @IsInt()
  @IsOptional()
  height_max_cm?: number;

  @IsArray()
  @IsOptional()
  marital_status_allowed?: string[];

  @IsArray()
  @IsOptional()
  education_levels?: string[];

  @IsArray()
  @IsOptional()
  occupations?: string[];

  @IsArray()
  @IsOptional()
  locations?: string[];

  @IsArray()
  @IsOptional()
  diet_preferences?: string[];

  @IsString()
  @IsOptional()
  smoking_preference?: string;

  @IsString()
  @IsOptional()
  drinking_preference?: string;

  @IsObject()
  @IsOptional()
  kundali_requirements?: Record<string, unknown>;
}
