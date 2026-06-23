import { IsUUID } from 'class-validator';

export class MatchKundaliDto {
  @IsUUID()
  profile1_id: string;

  @IsUUID()
  profile2_id: string;
}
