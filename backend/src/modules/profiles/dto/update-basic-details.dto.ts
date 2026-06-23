import { IsString, IsOptional } from 'class-validator';

export class UpdateBasicDetailsDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  community?: string;

  @IsString()
  @IsOptional()
  mother_tongue?: string;

  @IsString()
  @IsOptional()
  religion?: string;

  @IsString()
  @IsOptional()
  caste_subgroup?: string;

  @IsString()
  @IsOptional()
  gotra?: string;
}
