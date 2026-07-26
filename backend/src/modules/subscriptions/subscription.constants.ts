export const PLAN_BASIC = 'basic';
export const PLAN_PREMIUM = 'premium';

export type PlanCode = typeof PLAN_BASIC | typeof PLAN_PREMIUM;

export const PHOTO_LIMITS: Record<PlanCode, number> = {
  [PLAN_BASIC]: 5,
  [PLAN_PREMIUM]: 10,
};

export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'];

/** Number of verified profiles that receive the promotional free trial. */
export const FREE_TRIAL_LIMIT = 100;
export const FREE_TRIAL_MONTHS = 6;

export const SUPPORTED_COUNTRIES = ['IN', 'US'] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export const DEFAULT_COUNTRY: SupportedCountry = 'IN';

export const CURRENCY_BY_COUNTRY: Record<SupportedCountry, string> = {
  IN: 'INR',
  US: 'USD',
};

export const PROVIDER_BY_COUNTRY: Record<SupportedCountry, string> = {
  IN: 'razorpay',
  US: 'stripe',
};

const COUNTRY_NAME_ALIASES: Record<string, SupportedCountry> = {
  in: 'IN',
  india: 'IN',
  bharat: 'IN',
  us: 'US',
  usa: 'US',
  'united states': 'US',
  'united states of america': 'US',
};

export function normalizeCountry(
  value?: string | null,
): SupportedCountry | null {
  if (!value) {
    return null;
  }
  return COUNTRY_NAME_ALIASES[value.trim().toLowerCase()] ?? null;
}

export function currencyForCountry(country: SupportedCountry): string {
  return CURRENCY_BY_COUNTRY[country];
}

export function providerForCountry(country: SupportedCountry): string {
  return PROVIDER_BY_COUNTRY[country];
}
