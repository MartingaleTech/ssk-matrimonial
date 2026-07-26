import { useCallback, useEffect, useState } from 'react';
import { subscriptionsApi, Entitlements, MySubscription } from '../api/subscriptions';
import { useProfile } from '../context';

const BASIC_ENTITLEMENTS: Entitlements = {
  plan: 'basic',
  is_free_trial: false,
  photo_limit: 5,
  can_favorite: false,
  can_use_kundali_matching: false,
};

export interface UseEntitlementsResult {
  entitlements: Entitlements;
  subscription: MySubscription | null;
  country: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/** Loads the current profile's plan entitlements, defaulting to basic. */
export function useEntitlements(): UseEntitlementsResult {
  const { profile } = useProfile();
  const [entitlements, setEntitlements] = useState<Entitlements>(BASIC_ENTITLEMENTS);
  const [subscription, setSubscription] = useState<MySubscription | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) {
      setEntitlements(BASIC_ENTITLEMENTS);
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await subscriptionsApi.me(profile.id);
      setEntitlements(data.entitlements);
      setSubscription(data.subscription);
      setCountry(data.country);
    } catch {
      setEntitlements(BASIC_ENTITLEMENTS);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entitlements, subscription, country, loading, refresh };
}
