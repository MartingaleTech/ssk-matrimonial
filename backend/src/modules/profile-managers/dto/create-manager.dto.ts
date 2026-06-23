import { IsUUID, IsIn } from 'class-validator';

export class CreateManagerDto {
  @IsUUID()
  user_id: string;

  @IsIn(['owner', 'parent', 'family_member', 'matchmaker'])
  role: string;
}
