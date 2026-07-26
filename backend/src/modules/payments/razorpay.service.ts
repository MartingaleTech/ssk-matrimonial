import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';

export interface RazorpayCheckoutParams {
  planId: string;
  customerId?: string | null;
  email?: string | null;
  displayName: string;
  profileId: string;
  totalBillingCycles: number;
}

export interface RazorpayCheckoutResult {
  provider: 'razorpay';
  key_id?: string;
  customer_id: string | null;
  subscription_id: string;
  /** Razorpay short URL usable as a fallback when the SDK is unavailable. */
  short_url: string | null;
}

@Injectable()
export class RazorpayService {
  private readonly client: Razorpay | null;
  private readonly keyId?: string;
  private readonly webhookSecret?: string;

  constructor(configService: ConfigService) {
    this.keyId = configService.get<string>('payments.razorpay.keyId');
    const keySecret = configService.get<string>('payments.razorpay.keySecret');
    this.webhookSecret = configService.get<string>(
      'payments.razorpay.webhookSecret',
    );
    this.client =
      this.keyId && keySecret
        ? new Razorpay({ key_id: this.keyId, key_secret: keySecret })
        : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  private getClient(): Razorpay {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)',
      );
    }
    return this.client;
  }

  /**
   * Creates a Razorpay subscription; the client completes the first payment
   * with UPI, netbanking or a card through the Razorpay React Native SDK.
   */
  async createSubscription(
    params: RazorpayCheckoutParams,
  ): Promise<RazorpayCheckoutResult> {
    const client = this.getClient();

    const customerId =
      params.customerId ||
      (
        await client.customers.create({
          name: params.displayName,
          email: params.email ?? undefined,
          notes: { profile_id: params.profileId },
          fail_existing: 0,
        })
      ).id;

    const subscription = await client.subscriptions.create({
      plan_id: params.planId,
      total_count: params.totalBillingCycles,
      customer_notify: 1,
      notes: { profile_id: params.profileId },
    });

    return {
      provider: 'razorpay',
      key_id: this.keyId,
      customer_id: typeof customerId === 'string' ? customerId : null,
      subscription_id: subscription.id,
      short_url: subscription.short_url ?? null,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.getClient().subscriptions.cancel(subscriptionId);
  }

  verifyWebhook(payload: Buffer, signature?: string): Record<string, unknown> {
    if (!this.webhookSecret) {
      throw new ServiceUnavailableException(
        'Razorpay webhooks are not configured (RAZORPAY_WEBHOOK_SECRET missing)',
      );
    }
    if (!signature) {
      throw new UnauthorizedException('Missing x-razorpay-signature header');
    }

    const expected = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    const received = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    if (
      received.length !== expectedBuffer.length ||
      !timingSafeEqual(received, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid Razorpay signature');
    }

    return JSON.parse(payload.toString('utf8')) as Record<string, unknown>;
  }
}
