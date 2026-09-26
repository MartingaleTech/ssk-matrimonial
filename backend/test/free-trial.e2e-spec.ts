import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import {
  Profile,
  Subscription,
  SubscriptionPlan,
} from '../src/database/entities';
import { SubscriptionsService } from '../src/modules/subscriptions/subscriptions.service';
import { EntitlementsService } from '../src/modules/subscriptions/entitlements.service';
import {
  FREE_TRIAL_LIMIT,
  PLAN_PREMIUM,
} from '../src/modules/subscriptions/subscription.constants';

/**
 * Exercises `grantFreeTrialIfEligible` against a real Postgres so the
 * SERIALIZABLE guard around the {@link FREE_TRIAL_LIMIT} cap is what is under
 * test, not a mock. Pre-existing trials in the database are moved out of the
 * way for the duration of the suite and restored afterwards.
 */
describe('Free trial grant (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let subscriptions: SubscriptionsService;
  let entitlements: EntitlementsService;
  let createdPlan: SubscriptionPlan | null = null;
  const createdProfileIds: string[] = [];
  const parkedTrialIds: string[] = [];

  const createProfile = async () => {
    const profile = await dataSource.getRepository(Profile).save({
      display_name: `E2E ${randomUUID().slice(0, 8)}`,
      gender: 'female',
      date_of_birth: '1995-01-01',
      marital_status: 'never_married',
    });
    createdProfileIds.push(profile.id);
    return profile.id;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    subscriptions = app.get(SubscriptionsService);
    entitlements = app.get(EntitlementsService);

    const planRepo = dataSource.getRepository(SubscriptionPlan);
    if (!(await planRepo.findOne({ where: { code: PLAN_PREMIUM } }))) {
      createdPlan = await planRepo.save({
        code: PLAN_PREMIUM,
        name: 'Premium (e2e)',
      });
    }

    // Park any existing trials so the cap is measured from zero.
    const parked: { id: string }[] = await dataSource.query(
      `UPDATE subscriptions SET is_free_trial = false
       WHERE is_free_trial = true RETURNING id`,
    );
    parkedTrialIds.push(...parked.map((row) => row.id));
  });

  afterAll(async () => {
    if (createdProfileIds.length) {
      await dataSource.getRepository(Profile).delete(createdProfileIds);
    }
    if (parkedTrialIds.length) {
      await dataSource
        .getRepository(Subscription)
        .update({ id: In(parkedTrialIds) }, { is_free_trial: true });
    }
    if (createdPlan) {
      await dataSource.getRepository(SubscriptionPlan).delete(createdPlan.id);
    }
    await app.close();
  });

  it('grants a 6-month premium trial once per profile and unlocks premium entitlements', async () => {
    const profileId = await createProfile();

    const granted = await subscriptions.grantFreeTrialIfEligible(profileId);
    expect(granted).toMatchObject({
      profile_id: profileId,
      status: 'trialing',
      is_free_trial: true,
    });
    const months =
      (granted!.current_period_end.getFullYear() -
        granted!.current_period_start.getFullYear()) *
        12 +
      granted!.current_period_end.getMonth() -
      granted!.current_period_start.getMonth();
    expect(months).toBe(6);

    await expect(
      subscriptions.grantFreeTrialIfEligible(profileId),
    ).resolves.toBeNull();

    const result = await entitlements.getEntitlements(profileId);
    expect(result).toMatchObject({
      plan: 'premium',
      is_free_trial: true,
      can_favorite: true,
    });
  });

  it(`never grants more than ${FREE_TRIAL_LIMIT} trials under concurrent verification`, async () => {
    const already = await dataSource
      .getRepository(Subscription)
      .count({ where: { is_free_trial: true } });

    const attempts = FREE_TRIAL_LIMIT - already + 15;
    const profileIds: string[] = [];
    for (let i = 0; i < attempts; i++) {
      profileIds.push(await createProfile());
    }

    const countTrials = () =>
      dataSource
        .getRepository(Subscription)
        .count({ where: { is_free_trial: true } });

    // Burst: concurrent transactions must never overshoot the cap. Some may
    // lose the serialization race and get null; that is acceptable.
    const results = await Promise.all(
      profileIds.map((id) => subscriptions.grantFreeTrialIfEligible(id)),
    );
    const grantedInBurst = results.filter((r) => r !== null).length;
    expect(grantedInBurst).toBeLessThanOrEqual(FREE_TRIAL_LIMIT - already);
    expect(await countTrials()).toBeLessThanOrEqual(FREE_TRIAL_LIMIT);

    // Drain: retrying the losers sequentially fills exactly up to the cap.
    for (const [i, id] of profileIds.entries()) {
      if (results[i] === null) {
        await subscriptions.grantFreeTrialIfEligible(id);
      }
    }
    expect(await countTrials()).toBe(FREE_TRIAL_LIMIT);

    // With the cap reached, a fresh profile gets nothing and stays basic.
    const late = await createProfile();
    await expect(
      subscriptions.grantFreeTrialIfEligible(late),
    ).resolves.toBeNull();
    await expect(entitlements.getPlanCode(late)).resolves.toBe('basic');
    expect(await countTrials()).toBe(FREE_TRIAL_LIMIT);
  });
});
