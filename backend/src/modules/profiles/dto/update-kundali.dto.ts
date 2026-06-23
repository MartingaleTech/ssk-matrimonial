import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class UpdateKundaliDto {
  @IsString()
  @IsOptional()
  birth_date?: string;

  @IsString()
  @IsOptional()
  birth_time?: string;

  @IsString()
  @IsOptional()
  birth_place?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  rashi?: string;

  @IsString()
  @IsOptional()
  nakshatra?: string;

  @IsString()
  @IsOptional()
  lagna?: string;

  @IsString()
  @IsOptional()
  manglik_status?: string;

  @IsObject()
  @IsOptional()
  planetary_positions?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  houses?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  doshas?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  kundali_generated?: boolean;

  @IsString()
  @IsOptional()
  kundali_source?: string;
}
