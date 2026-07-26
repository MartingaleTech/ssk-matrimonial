import { IsUUID } from 'class-validator';

export class CancelSubscriptionDto {
  @IsUUID()
  profile_id: string;
}
