import { IsBoolean, IsOptional, IsIn } from 'class-validator';

export class UpdatePhotoDto {
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @IsIn(['public', 'private'])
  @IsOptional()
  visibility?: string;
}
