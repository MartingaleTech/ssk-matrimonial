import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface StripeCheckoutParams {
  priceId: string;
  customerId?: string | null;
  email?: string | null;
  profileId: string;
}

export interface StripeCheckoutResult {
  provider: 'stripe';
  publishable_key?: string;
  customer_id: string;
  subscription_id: string;
  client_secret: string | null;
}

@Injectable()
export class StripeService {
  private readonly client: Stripe | null;
  private readonly publishableKey?: string;
  private readonly webhookSecret?: string;

  constructor(configService: ConfigService) {
    const secretKey = configService.get<string>('payments.stripe.secretKey');
    this.publishableKey = configService.get<string>(
      'payments.stripe.publishableKey',
    );
    this.webhookSecret = configService.get<string>(
      'payments.stripe.webhookSecret',
    );
    this.client = secretKey ? new Stripe(secretKey) : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  private getClient(): Stripe {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Stripe is not configured (STRIPE_SECRET_KEY missing)',
      );
    }
    return this.client;
  }

  /**
   * Creates an incomplete subscription so the client can confirm the first
   * payment with the Stripe React Native SDK (card, Apple Pay or ACH).
   */
  async createSubscription(
    params: StripeCheckoutParams,
  ): Promise<StripeCheckoutResult> {
    const client = this.getClient();

    const customerId =
      params.customerId ||
      (
        await client.customers.create({
          email: params.email ?? undefined,
          metadata: { profile_id: params.profileId },
        })
      ).id;

    const subscription = await client.subscriptions.create({
      customer: customerId,
      items: [{ price: params.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card', 'us_bank_account'],
      },
      expand: ['latest_invoice.confirmation_secret'],
      metadata: { profile_id: params.profileId },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice | null;

    return {
      provider: 'stripe',
      publishable_key: this.publishableKey,
      customer_id: customerId,
      subscription_id: subscription.id,
      client_secret: invoice?.confirmation_secret?.client_secret ?? null,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.getClient().subscriptions.cancel(subscriptionId);
  }

  verifyWebhook(payload: Buffer, signature?: string): Stripe.Event {
    if (!this.webhookSecret) {
      throw new ServiceUnavailableException(
        'Stripe webhooks are not configured (STRIPE_WEBHOOK_SECRET missing)',
      );
    }
    if (!signature) {
      throw new UnauthorizedException('Missing stripe-signature header');
    }
    return this.getClient().webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );
  }
}
