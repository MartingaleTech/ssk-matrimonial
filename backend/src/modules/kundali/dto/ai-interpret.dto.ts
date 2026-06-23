import { IsUUID, IsOptional } from 'class-validator';

export class AiInterpretDto {
  @IsUUID()
  profile_id: string;

  @IsUUID()
  @IsOptional()
  match_profile_id?: string;
}
