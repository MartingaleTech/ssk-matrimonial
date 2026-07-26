import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PLAN_BASIC, PLAN_PREMIUM } from '../subscription.constants';

export class CheckoutDto {
  @IsUUID()
  profile_id: string;

  @IsIn([PLAN_BASIC, PLAN_PREMIUM])
  plan_code: string;

  @IsIn(['upi', 'card', 'apple_pay', 'bank', 'ach'])
  @IsOptional()
  method?: string;
}
