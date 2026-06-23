import { IsBoolean, IsOptional, IsInt, IsArray } from 'class-validator';

export class UpdateKundaliPreferencesDto {
  @IsBoolean()
  @IsOptional()
  require_kundali_match?: boolean;

  @IsInt()
  @IsOptional()
  minimum_guna_score?: number;

  @IsArray()
  @IsOptional()
  preferred_doshas?: string[];

  @IsArray()
  @IsOptional()
  preferred_rashi?: string[];

  @IsArray()
  @IsOptional()
  preferred_nakshatra?: string[];
}
