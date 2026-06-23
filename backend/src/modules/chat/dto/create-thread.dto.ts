import { IsUUID } from 'class-validator';

export class CreateThreadDto {
  @IsUUID()
  profile1_id: string;

  @IsUUID()
  profile2_id: string;
}
