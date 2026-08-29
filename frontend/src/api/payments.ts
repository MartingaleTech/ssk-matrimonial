import { Linking } from 'react-native';
import { CheckoutResponse, RazorpayCheckout as RazorpayParams, StripeCheckout } from './subscriptions';

type StripeSdk = {
  initStripe: (options: { publishableKey: string; merchantIdentifier?: string }) => Promise<void>;
  initPaymentSheet: (options: {
    merchantDisplayName: string;
    paymentIntentClientSecret: string;
    customerId?: string;
    applePay?: { merchantCountryCode: string };
    allowsDelayedPaymentMethods?: boolean;
  }) => Promise<{ error?: { message: string } }>;
  presentPaymentSheet: () => Promise<{ error?: { code?: string; message: string } }>;
};

type RazorpaySdk = {
  open: (options: {
    key: string;
    name: string;
    description: string;
    subscription_id?: string;
    currency: string;
    amount: number;
    theme: { color: string };
  }) => Promise<{ razorpay_payment_id?: string }>;
};

function getStripeSdk(): StripeSdk | null {
  try {
    const sdk = require('@stripe/stripe-react-native');
    return sdk as StripeSdk;
  } catch {
    return null;
  }
}

function getRazorpaySdk(): RazorpaySdk | null {
  try {
    const sdk = require('react-native-razorpay');
    return (sdk?.default ?? sdk) as RazorpaySdk;
  } catch {
    return null;
  }
}

export interface PaymentOutcome {
  status: 'completed' | 'cancelled' | 'failed';
  message?: string;
}

interface RazorpaySuccess {
  razorpay_payment_id: string;
}

/**
 * Confirms the first subscription payment with the provider SDK. The
 * subscription only becomes active once the provider webhook reaches the API.
 */
export const paymentsApi = {
  async pay(checkout: CheckoutResponse): Promise<PaymentOutcome> {
    return checkout.checkout.provider === 'stripe'
      ? payWithStripe(checkout.checkout, checkout)
      : payWithRazorpay(checkout.checkout, checkout);
  },
};

async function payWithStripe(
  params: StripeCheckout,
  checkout: CheckoutResponse,
): Promise<PaymentOutcome> {
  if (!params.publishable_key || !params.client_secret) {
    return { status: 'failed', message: 'Stripe is not configured' };
  }

  const StripeSdk = getStripeSdk();
  if (!StripeSdk) {
    if ('checkout_url' in params && params.checkout_url && (await Linking.canOpenURL(params.checkout_url))) {
      await Linking.openURL(params.checkout_url);
      return { status: 'cancelled', message: 'Complete the payment in your browser' };
    }
    return {
      status: 'failed',
      message: 'Stripe is not available in this environment. Please continue in the browser.',
    };
  }

  await StripeSdk.initStripe({
    publishableKey: params.publishable_key,
    merchantIdentifier: 'merchant.com.ssk.matrimonial',
  });

  const init = await StripeSdk.initPaymentSheet({
    merchantDisplayName: 'SSK Matrimonial',
    paymentIntentClientSecret: params.client_secret,
    customerId: params.customer_id ?? undefined,
    applePay: { merchantCountryCode: checkout.country },
    allowsDelayedPaymentMethods: true,
  });
  if (init.error) {
    return { status: 'failed', message: init.error.message };
  }

  const result = await StripeSdk.presentPaymentSheet();
  if (result.error) {
    return {
      status: result.error.code === 'Canceled' ? 'cancelled' : 'failed',
      message: result.error.message,
    };
  }
  return { status: 'completed' };
}

async function payWithRazorpay(
  params: RazorpayParams,
  checkout: CheckoutResponse,
): Promise<PaymentOutcome> {
  if (!params.key_id) {
    return { status: 'failed', message: 'Razorpay is not configured' };
  }

  const RazorpayCheckout = getRazorpaySdk();

  if (!RazorpayCheckout) {
    if (params.short_url && (await Linking.canOpenURL(params.short_url))) {
      await Linking.openURL(params.short_url);
      return { status: 'cancelled', message: 'Complete the payment in your browser' };
    }
    return {
      status: 'failed',
      message: 'Razorpay is not available in this environment. Please continue in the browser.',
    };
  }

  try {
    const result = (await RazorpayCheckout.open({
      key: params.key_id,
      name: 'SSK Matrimonial',
      description: `${checkout.plan_code} plan`,
      subscription_id: params.subscription_id,
      currency: checkout.currency,
      amount: checkout.amount,
      theme: { color: '#B5446E' },
    })) as RazorpaySuccess;

    return result.razorpay_payment_id
      ? { status: 'completed' }
      : { status: 'failed', message: 'Payment was not completed' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment failed';
    // Fall back to the hosted page when the native SDK is unavailable.
    if (params.short_url && (await Linking.canOpenURL(params.short_url))) {
      await Linking.openURL(params.short_url);
      return { status: 'cancelled', message: 'Complete the payment in your browser' };
    }
    return { status: 'failed', message };
  }
}
