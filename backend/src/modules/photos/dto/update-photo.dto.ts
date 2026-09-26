import { IsBoolean, IsOptional, IsIn } from 'class-validator';
import { PHOTO_VISIBILITIES } from './presign-photo.dto';

export class UpdatePhotoDto {
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @IsIn(PHOTO_VISIBILITIES)
  @IsOptional()
  visibility?: string;
}
