import { IsUUID, IsString, IsOptional } from 'class-validator';

export class VerifyContactDto {
  @IsUUID()
  profile_id: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
