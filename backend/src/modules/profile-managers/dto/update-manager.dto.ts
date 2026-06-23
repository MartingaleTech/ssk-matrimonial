import { IsIn, IsOptional } from 'class-validator';

export class UpdateManagerDto {
  @IsIn(['owner', 'parent', 'family_member', 'matchmaker'])
  @IsOptional()
  role?: string;
}
