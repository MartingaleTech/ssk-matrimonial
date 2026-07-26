import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment, Subscription } from '../../database/entities';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    subscription?: {
      entity?: {
        id?: string;
        status?: string;
        current_start?: number;
        current_end?: number;
      };
    };
    payment?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
        method?: string;
        subscription_id?: string;
      };
    };
  };
}

const RAZORPAY_STATUS_MAP: Record<string, string> = {
  authenticated: 'active',
  active: 'active',
  pending: 'past_due',
  halted: 'past_due',
  cancelled: 'cancelled',
  completed: 'expired',
  expired: 'expired',
};

const STRIPE_STATUS_MAP: Record<string, string> = {
  trialing: 'trialing',
  active: 'active',
  past_due: 'past_due',
  unpaid: 'past_due',
  incomplete: 'past_due',
  incomplete_expired: 'expired',
  canceled: 'cancelled',
  paused: 'past_due',
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private stripeService: StripeService,
    private razorpayService: RazorpayService,
  ) {}

  async handleStripeWebhook(payload: Buffer, signature?: string) {
    const event = this.stripeService.verifyWebhook(payload, signature);

    switch (event.type) {
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await this.handleStripeInvoice(event.data.object, 'succeeded');
        break;
      case 'invoice.payment_failed':
        await this.handleStripeInvoice(event.data.object, 'failed');
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleStripeSubscription(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event ${event.type}`);
    }

    return { received: true };
  }

  async handleRazorpayWebhook(payload: Buffer, signature?: string) {
    const body = this.razorpayService.verifyWebhook(
      payload,
      signature,
    ) as RazorpayWebhookPayload;

    const subscriptionEntity = body.payload?.subscription?.entity;
    const paymentEntity = body.payload?.payment?.entity;
    const providerSubscriptionId =
      subscriptionEntity?.id ?? paymentEntity?.subscription_id;

    if (!providerSubscriptionId) {
      this.logger.debug(`Unhandled Razorpay event ${body.event}`);
      return { received: true };
    }

    const subscription = await this.findByProviderSubscriptionId(
      'razorpay',
      providerSubscriptionId,
    );
    if (!subscription) {
      this.logger.warn(
        `Razorpay subscription ${providerSubscriptionId} not found locally`,
      );
      return { received: true };
    }

    const event = body.event ?? '';

    if (event === 'payment.failed') {
      subscription.status = 'past_due';
    } else if (subscriptionEntity?.status) {
      subscription.status =
        RAZORPAY_STATUS_MAP[subscriptionEntity.status] ?? subscription.status;
    } else if (event === 'subscription.charged') {
      subscription.status = 'active';
    }

    if (subscription.status === 'cancelled' && !subscription.cancelled_at) {
      subscription.cancelled_at = new Date();
    }
    if (subscriptionEntity?.current_start) {
      subscription.current_period_start = new Date(
        subscriptionEntity.current_start * 1000,
      );
    }
    if (subscriptionEntity?.current_end) {
      subscription.current_period_end = new Date(
        subscriptionEntity.current_end * 1000,
      );
    }
    subscription.is_free_trial = false;
    await this.subscriptionRepo.save(subscription);

    if (paymentEntity?.id) {
      await this.recordPayment({
        subscriptionId: subscription.id,
        provider: 'razorpay',
        providerPaymentId: paymentEntity.id,
        amount: paymentEntity.amount ?? 0,
        currency: (paymentEntity.currency ?? 'INR').toUpperCase(),
        status: event === 'payment.failed' ? 'failed' : 'succeeded',
        method: this.mapRazorpayMethod(paymentEntity.method),
      });
    }

    return { received: true };
  }

  private async handleStripeInvoice(
    invoice: Stripe.Invoice,
    status: 'succeeded' | 'failed',
  ) {
    const providerSubscriptionId = this.extractInvoiceSubscriptionId(invoice);
    if (!providerSubscriptionId) {
      return;
    }

    const subscription = await this.findByProviderSubscriptionId(
      'stripe',
      providerSubscriptionId,
    );
    if (!subscription) {
      this.logger.warn(
        `Stripe subscription ${providerSubscriptionId} not found locally`,
      );
      return;
    }

    subscription.status = status === 'succeeded' ? 'active' : 'past_due';
    subscription.is_free_trial = false;
    if (invoice.period_start) {
      subscription.current_period_start = new Date(invoice.period_start * 1000);
    }
    if (invoice.period_end) {
      subscription.current_period_end = new Date(invoice.period_end * 1000);
    }
    await this.subscriptionRepo.save(subscription);

    await this.recordPayment({
      subscriptionId: subscription.id,
      provider: 'stripe',
      providerPaymentId: invoice.id ?? `invoice_${subscription.id}`,
      amount:
        status === 'succeeded'
          ? invoice.amount_paid
          : (invoice.amount_due ?? 0),
      currency: (invoice.currency ?? 'USD').toUpperCase(),
      status,
      method: 'card',
    });
  }

  private async handleStripeSubscription(
    stripeSubscription: Stripe.Subscription,
  ) {
    const subscription = await this.findByProviderSubscriptionId(
      'stripe',
      stripeSubscription.id,
    );
    if (!subscription) {
      return;
    }

    subscription.status =
      STRIPE_STATUS_MAP[stripeSubscription.status] ?? subscription.status;
    if (subscription.status === 'cancelled' && !subscription.cancelled_at) {
      subscription.cancelled_at = new Date();
    }

    const item = stripeSubscription.items?.data?.[0];
    if (item?.current_period_start) {
      subscription.current_period_start = new Date(
        item.current_period_start * 1000,
      );
    }
    if (item?.current_period_end) {
      subscription.current_period_end = new Date(
        item.current_period_end * 1000,
      );
    }

    await this.subscriptionRepo.save(subscription);
  }

  private extractInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    const parent = invoice.parent?.subscription_details?.subscription;
    if (typeof parent === 'string') {
      return parent;
    }
    if (parent && typeof parent === 'object') {
      return parent.id;
    }
    const lineSubscription =
      invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;
    return typeof lineSubscription === 'string' ? lineSubscription : null;
  }

  private async findByProviderSubscriptionId(
    provider: string,
    providerSubscriptionId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: { provider, provider_subscription_id: providerSubscriptionId },
    });
  }

  private async recordPayment(params: {
    subscriptionId: string;
    provider: string;
    providerPaymentId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
  }): Promise<void> {
    const existing = await this.paymentRepo.findOne({
      where: {
        provider: params.provider,
        provider_payment_id: params.providerPaymentId,
      },
    });

    if (existing) {
      existing.status = params.status;
      await this.paymentRepo.save(existing);
      return;
    }

    await this.paymentRepo.save(
      this.paymentRepo.create({
        subscription_id: params.subscriptionId,
        provider: params.provider,
        provider_payment_id: params.providerPaymentId,
        amount: params.amount,
        currency: params.currency,
        status: params.status,
        method: params.method,
      }),
    );
  }

  private mapRazorpayMethod(method?: string): string {
    switch (method) {
      case 'upi':
        return 'upi';
      case 'card':
        return 'card';
      case 'netbanking':
      case 'emandate':
        return 'bank';
      default:
        return method ?? 'card';
    }
  }
}
