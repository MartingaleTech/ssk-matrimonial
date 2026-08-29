import client from './client';

export type PlanCode = 'basic' | 'premium';
export type PaymentProvider = 'stripe' | 'razorpay';

export interface PlanPrice {
  amount: number;
  currency: string;
  interval: string;
}

export interface SubscriptionPlan {
  id: string;
  code: PlanCode;
  name: string;
  features: Record<string, unknown>;
  price: PlanPrice | null;
}

export interface PlansResponse {
  country: string;
  currency: string;
  provider: PaymentProvider;
  plans: SubscriptionPlan[];
}

export interface Entitlements {
  plan: PlanCode;
  is_free_trial: boolean;
  photo_limit: number;
  can_favorite: boolean;
  can_use_kundali_matching: boolean;
}

export interface MySubscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
  plan_code?: PlanCode;
  provider?: PaymentProvider;
  is_free_trial: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
}

export interface MySubscriptionResponse {
  profile_id: string;
  country: string;
  currency: string;
  subscription: MySubscription | null;
  entitlements: Entitlements;
}

export interface StripeCheckout {
  provider: 'stripe';
  publishable_key?: string;
  customer_id: string | null;
  subscription_id: string;
  client_secret: string | null;
  checkout_url?: string | null;
}

export interface RazorpayCheckout {
  provider: 'razorpay';
  key_id?: string;
  customer_id: string | null;
  subscription_id: string;
  short_url: string | null;
}

export interface CheckoutResponse {
  subscription_id: string;
  plan_code: PlanCode;
  country: string;
  amount: number;
  currency: string;
  checkout: StripeCheckout | RazorpayCheckout;
}

export const subscriptionsApi = {
  plans: (country?: string) =>
    client.get<PlansResponse>('/subscriptions/plans', {
      params: country ? { country } : undefined,
    }),

  me: (profileId: string) =>
    client.get<MySubscriptionResponse>('/subscriptions/me', {
      params: { profile_id: profileId },
    }),

  checkout: (data: { profile_id: string; plan_code: PlanCode; method?: string }) =>
    client.post<CheckoutResponse>('/subscriptions/checkout', data),

  cancel: (profileId: string) =>
    client.post<{ message: string; id: string }>('/subscriptions/cancel', {
      profile_id: profileId,
    }),
};
