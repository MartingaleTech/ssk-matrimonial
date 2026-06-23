import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateConnectionDto {
  @IsUUID()
  from_profile_id: string;

  @IsUUID()
  to_profile_id: string;

  @IsString()
  @IsOptional()
  message?: string;
}
