import { IsUUID, IsString, IsOptional, IsObject } from 'class-validator';

export class VerifyDocumentDto {
  @IsUUID()
  profile_id: string;

  @IsString()
  document_url: string;

  @IsString()
  @IsOptional()
  document_type?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
