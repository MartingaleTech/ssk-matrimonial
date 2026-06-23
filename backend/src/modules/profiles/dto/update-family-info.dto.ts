import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateFamilyInfoDto {
  @IsString()
  @IsOptional()
  family_type?: string;

  @IsString()
  @IsOptional()
  father_occupation?: string;

  @IsString()
  @IsOptional()
  mother_occupation?: string;

  @IsInt()
  @IsOptional()
  siblings_brothers?: number;

  @IsInt()
  @IsOptional()
  siblings_sisters?: number;

  @IsString()
  @IsOptional()
  family_status?: string;

  @IsString()
  @IsOptional()
  family_values?: string;
}
