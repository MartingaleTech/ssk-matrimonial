import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateBlockDto {
  @IsUUID()
  blocked_by_profile_id: string;

  @IsUUID()
  blocked_profile_id: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
