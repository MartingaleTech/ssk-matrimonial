import { IsIn, IsOptional } from 'class-validator';

export const PHOTO_VISIBILITIES = ['public', 'private', 'connected_only'];

export const ALLOWED_PHOTO_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export class PresignPhotoDto {
  @IsIn(Object.keys(ALLOWED_PHOTO_MIME_TYPES))
  content_type: string;

  @IsIn(PHOTO_VISIBILITIES)
  @IsOptional()
  visibility?: string;
}
