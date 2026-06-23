import { IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreatePhotoDto {
  @IsString()
  url: string;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @IsIn(['public', 'private'])
  @IsOptional()
  visibility?: string;
}
