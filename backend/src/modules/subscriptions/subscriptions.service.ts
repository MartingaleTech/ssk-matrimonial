import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import {
  PlanPrice,
  Profile,
  ProfileLocation,
  ProfileManager,
  Subscription,
  SubscriptionPlan,
  User,
} from '../../database/entities';
import { StripeService } from '../payments/stripe.service';
import { RazorpayService } from '../payments/razorpay.service';
import { EntitlementsService } from './entitlements.service';
import { CancelSubscriptionDto, CheckoutDto } from './dto';
import {
  DEFAULT_COUNTRY,
  FREE_TRIAL_LIMIT,
  FREE_TRIAL_MONTHS,
  PLAN_PREMIUM,
  SupportedCountry,
  currencyForCountry,
  normalizeCountry,
  providerForCountry,
} from './subscription.constants';

/** Razorpay subscriptions need a finite cycle count; ~10 years of monthly billing. */
const RAZORPAY_TOTAL_BILLING_CYCLES = 120;

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(PlanPrice)
    private priceRepo: Repository<PlanPrice>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(ProfileLocation)
    private locationRepo: Repository<ProfileLocation>,
    @InjectRepository(ProfileManager)
    private managerRepo: Repository<ProfileManager>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly stripeService: StripeService,
    private readonly razorpayService: RazorpayService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async listPlans(countryQuery?: string) {
    const country = normalizeCountry(countryQuery) ?? DEFAULT_COUNTRY;
    const plans = await this.planRepo.find({ relations: ['prices'] });

    return {
      country,
      currency: currencyForCountry(country),
      provider: providerForCountry(country),
      plans: plans.map((plan) => {
        const price = plan.prices?.find((p) => p.country === country);
        return {
          id: plan.id,
          code: plan.code,
          name: plan.name,
          features: plan.features,
          price: price
            ? {
                amount: price.amount,
                currency: price.currency,
                interval: price.interval,
              }
            : null,
        };
      }),
    };
  }

  async getMine(profileId: string, userId: string) {
    if (!profileId) {
      throw new BadRequestException('profile_id is required');
    }
    await this.getManagerOrFail(userId, profileId);

    const subscription =
      await this.entitlementsService.getActiveSubscription(profileId);
    const entitlements =
      await this.entitlementsService.getEntitlements(profileId);
    const profile = await this.getProfileOrFail(profileId);
    const country = await this.resolveCountry(profile);

    return {
      profile_id: profileId,
      country,
      currency: currencyForCountry(country),
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            plan_code: subscription.plan?.code,
            provider: subscription.provider,
            is_free_trial: subscription.is_free_trial,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
          }
        : null,
      entitlements,
    };
  }

  async checkout(dto: CheckoutDto, userId: string) {
    const manager = await this.getManagerOrFail(userId, dto.profile_id);
    if (manager.role !== 'owner' && manager.role !== 'parent') {
      throw new ForbiddenException(
        'Only owner or parent can manage subscriptions',
      );
    }

    const profile = await this.getProfileOrFail(dto.profile_id);
    const country = await this.resolveCountry(profile);
    const provider = providerForCountry(country);

    const plan = await this.planRepo.findOne({
      where: { code: dto.plan_code },
    });
    if (!plan) {
      throw new NotFoundException(`Plan ${dto.plan_code} not found`);
    }

    const price = await this.priceRepo.findOne({
      where: { plan_id: plan.id, country },
    });
    if (!price) {
      throw new NotFoundException(
        `Plan ${dto.plan_code} is not available in ${country}`,
      );
    }
    if (!price.provider_price_id) {
      throw new BadRequestException(
        `Plan ${dto.plan_code} has no ${provider} price configured for ${country}`,
      );
    }

    const existingActive = await this.entitlementsService.getActiveSubscription(
      dto.profile_id,
    );
    if (existingActive && !existingActive.is_free_trial) {
      throw new BadRequestException(
        'Profile already has an active subscription',
      );
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    const previous = await this.subscriptionRepo.findOne({
      where: { profile_id: dto.profile_id, provider },
      order: { created_at: 'DESC' },
    });

    const checkout =
      provider === 'stripe'
        ? await this.stripeService.createSubscription({
            priceId: price.provider_price_id,
            customerId: previous?.provider_customer_id,
            email: user?.email,
            profileId: dto.profile_id,
          })
        : await this.razorpayService.createSubscription({
            planId: price.provider_price_id,
            customerId: previous?.provider_customer_id,
            email: user?.email,
            displayName: profile.display_name,
            profileId: dto.profile_id,
            totalBillingCycles: RAZORPAY_TOTAL_BILLING_CYCLES,
          });

    // Stays `past_due` until the provider webhook confirms the first payment.
    const subscription = await this.subscriptionRepo.save(
      this.subscriptionRepo.create({
        profile_id: dto.profile_id,
        plan_id: plan.id,
        status: 'past_due',
        provider,
        provider_subscription_id: checkout.subscription_id,
        provider_customer_id: checkout.customer_id ?? undefined,
        is_free_trial: false,
      }),
    );

    return {
      subscription_id: subscription.id,
      plan_code: plan.code,
      country,
      amount: price.amount,
      currency: price.currency,
      checkout,
    };
  }

  async cancel(dto: CancelSubscriptionDto, userId: string) {
    const manager = await this.getManagerOrFail(userId, dto.profile_id);
    if (manager.role !== 'owner' && manager.role !== 'parent') {
      throw new ForbiddenException(
        'Only owner or parent can manage subscriptions',
      );
    }

    const subscription = await this.entitlementsService.getActiveSubscription(
      dto.profile_id,
    );
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (subscription.provider_subscription_id) {
      if (subscription.provider === 'stripe') {
        await this.stripeService.cancelSubscription(
          subscription.provider_subscription_id,
        );
      } else if (subscription.provider === 'razorpay') {
        await this.razorpayService.cancelSubscription(
          subscription.provider_subscription_id,
        );
      }
    }

    subscription.status = 'cancelled';
    subscription.cancelled_at = new Date();
    await this.subscriptionRepo.save(subscription);

    return { message: 'Subscription cancelled', id: subscription.id };
  }

  /**
   * Grants the promotional premium trial to the first {@link FREE_TRIAL_LIMIT}
   * verified profiles. Runs serializably so concurrent verifications cannot
   * push the number of granted trials past the cap.
   */
  async grantFreeTrialIfEligible(
    profileId: string,
  ): Promise<Subscription | null> {
    try {
      return await this.dataSource.transaction(
        'SERIALIZABLE',
        async (manager) => {
          const existing = await manager.findOne(Subscription, {
            where: { profile_id: profileId, status: Not('expired') },
          });
          if (existing) {
            return null;
          }

          const granted = await manager.count(Subscription, {
            where: { is_free_trial: true },
          });
          if (granted >= FREE_TRIAL_LIMIT) {
            return null;
          }

          const plan = await manager.findOne(SubscriptionPlan, {
            where: { code: PLAN_PREMIUM },
          });
          if (!plan) {
            this.logger.warn(
              'Premium plan is missing - cannot grant the free trial',
            );
            return null;
          }

          const start = new Date();
          const end = new Date(start);
          end.setMonth(end.getMonth() + FREE_TRIAL_MONTHS);

          return manager.save(
            manager.create(Subscription, {
              profile_id: profileId,
              plan_id: plan.id,
              status: 'trialing',
              is_free_trial: true,
              current_period_start: start,
              current_period_end: end,
            }),
          );
        },
      );
    } catch (error) {
      // A serialization failure means a concurrent verification won the slot.
      this.logger.warn(
        `Free trial grant skipped for ${profileId}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  async resolveCountry(profile: Profile): Promise<SupportedCountry> {
    const direct = normalizeCountry(profile.country);
    if (direct) {
      return direct;
    }

    const location = await this.locationRepo.findOne({
      where: { profile_id: profile.id },
    });
    const country = normalizeCountry(location?.country) ?? DEFAULT_COUNTRY;

    await this.profileRepo.update(profile.id, {
      country,
      currency: currencyForCountry(country),
    });

    return country;
  }

  private async getProfileOrFail(profileId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  private async getManagerOrFail(
    userId: string,
    profileId: string,
  ): Promise<ProfileManager> {
    const manager = await this.managerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });
    if (!manager) {
      throw new ForbiddenException('You are not a manager of this profile');
    }
    return manager;
  }
}
