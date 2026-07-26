import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, MoreThan, Repository } from 'typeorm';
import { Subscription } from '../../database/entities';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  PHOTO_LIMITS,
  PLAN_BASIC,
  PLAN_PREMIUM,
  PlanCode,
} from './subscription.constants';

export interface Entitlements {
  plan: PlanCode;
  is_free_trial: boolean;
  photo_limit: number;
  can_favorite: boolean;
  can_use_kundali_matching: boolean;
}

@Injectable()
export class EntitlementsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
  ) {}

  async getActiveSubscription(profileId: string): Promise<Subscription | null> {
    const base = {
      profile_id: profileId,
      status: In(ACTIVE_SUBSCRIPTION_STATUSES),
    };
    return this.subscriptionRepo.findOne({
      where: [
        { ...base, current_period_end: MoreThan(new Date()) },
        { ...base, current_period_end: IsNull() },
      ],
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });
  }

  async getPlanCode(profileId: string): Promise<PlanCode> {
    const subscription = await this.getActiveSubscription(profileId);
    return subscription?.plan?.code === PLAN_PREMIUM
      ? PLAN_PREMIUM
      : PLAN_BASIC;
  }

  async getEntitlements(profileId: string): Promise<Entitlements> {
    const subscription = await this.getActiveSubscription(profileId);
    const plan: PlanCode =
      subscription?.plan?.code === PLAN_PREMIUM ? PLAN_PREMIUM : PLAN_BASIC;
    const isPremium = plan === PLAN_PREMIUM;

    return {
      plan,
      is_free_trial: subscription?.is_free_trial ?? false,
      photo_limit: PHOTO_LIMITS[plan],
      can_favorite: isPremium,
      can_use_kundali_matching: isPremium,
    };
  }

  async getPhotoLimit(profileId: string): Promise<number> {
    return PHOTO_LIMITS[await this.getPlanCode(profileId)];
  }

  async canFavorite(profileId: string): Promise<boolean> {
    return (await this.getPlanCode(profileId)) === PLAN_PREMIUM;
  }

  async canUseKundaliMatching(profileId: string): Promise<boolean> {
    return (await this.getPlanCode(profileId)) === PLAN_PREMIUM;
  }

  async assertPremium(profileId: string, feature: string): Promise<void> {
    if ((await this.getPlanCode(profileId)) !== PLAN_PREMIUM) {
      throw new ForbiddenException(
        `${feature} requires an active premium subscription`,
      );
    }
  }
}
