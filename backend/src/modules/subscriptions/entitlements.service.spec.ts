import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Subscription } from '../../database/entities';
import { EntitlementsService } from './entitlements.service';
import { PHOTO_LIMITS } from './subscription.constants';

describe('EntitlementsService', () => {
  let repo: { findOne: jest.Mock };
  let service: EntitlementsService;

  beforeEach(() => {
    repo = { findOne: jest.fn() };
    service = new EntitlementsService(
      repo as unknown as Repository<Subscription>,
    );
  });

  it('falls back to the basic plan when there is no active subscription', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.getEntitlements('p1')).resolves.toEqual({
      plan: 'basic',
      is_free_trial: false,
      photo_limit: PHOTO_LIMITS.basic,
      can_favorite: false,
      can_use_kundali_matching: false,
    });
    await expect(service.canFavorite('p1')).resolves.toBe(false);
  });

  it('unlocks premium features for an active premium subscription', async () => {
    repo.findOne.mockResolvedValue({
      plan: { code: 'premium' },
      is_free_trial: true,
    });

    await expect(service.getEntitlements('p1')).resolves.toEqual({
      plan: 'premium',
      is_free_trial: true,
      photo_limit: PHOTO_LIMITS.premium,
      can_favorite: true,
      can_use_kundali_matching: true,
    });
    await expect(
      service.assertPremium('p1', 'Favorites'),
    ).resolves.toBeUndefined();
  });

  it('treats a non-premium plan as basic', async () => {
    repo.findOne.mockResolvedValue({ plan: { code: 'basic' } });

    await expect(service.getPlanCode('p1')).resolves.toBe('basic');
    await expect(service.assertPremium('p1', 'Favorites')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('only considers active/trialing subscriptions that have not ended', async () => {
    repo.findOne.mockResolvedValue(null);
    await service.getActiveSubscription('p1');

    const { where } = repo.findOne.mock.calls[0][0];
    expect(where).toHaveLength(2);
    for (const clause of where) {
      expect(clause.profile_id).toBe('p1');
      expect(clause.status).toMatchObject({ _type: 'in' });
      expect(clause.status._value).toEqual(['active', 'trialing']);
    }
    expect(where[0].current_period_end._type).toBe('moreThan');
    expect(where[1].current_period_end._type).toBe('isNull');
  });
});
