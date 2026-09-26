import {
  IsString,
  IsBoolean,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';
import { PHOTO_VISIBILITIES } from './presign-photo.dto';

export class CreatePhotoDto {
  @IsString()
  @MaxLength(1000)
  url: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  storage_key?: string;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @IsIn(PHOTO_VISIBILITIES)
  @IsOptional()
  visibility?: string;
}
