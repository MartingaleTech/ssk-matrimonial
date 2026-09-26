import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment, Subscription } from '../../database/entities';
import { PaymentsService } from './payments.service';
import { RazorpayService } from './razorpay.service';
import { StripeService } from './stripe.service';

type RepoMock = {
  findOne: jest.Mock;
  save: jest.Mock;
  create: jest.Mock;
};

function repoMock(): RepoMock {
  return {
    findOne: jest.fn(),
    save: jest.fn(async (entity) => entity),
    create: jest.fn((entity) => entity),
  };
}

describe('PaymentsService', () => {
  let subscriptionRepo: RepoMock;
  let paymentRepo: RepoMock;
  let stripe: { verifyWebhook: jest.Mock };
  let razorpay: { verifyWebhook: jest.Mock };
  let service: PaymentsService;

  const localSubscription = () =>
    ({
      id: 'sub-local',
      provider: 'razorpay',
      provider_subscription_id: 'sub_rzp',
      status: 'past_due',
      is_free_trial: true,
      cancelled_at: null,
    }) as unknown as Subscription;

  beforeEach(() => {
    subscriptionRepo = repoMock();
    paymentRepo = repoMock();
    stripe = { verifyWebhook: jest.fn() };
    razorpay = { verifyWebhook: jest.fn() };
    service = new PaymentsService(
      subscriptionRepo as unknown as Repository<Subscription>,
      paymentRepo as unknown as Repository<Payment>,
      stripe as unknown as StripeService,
      razorpay as unknown as RazorpayService,
    );
  });

  describe('handleRazorpayWebhook', () => {
    it('does not touch the database when the signature is invalid', async () => {
      razorpay.verifyWebhook.mockImplementation(() => {
        throw new UnauthorizedException();
      });

      await expect(
        service.handleRazorpayWebhook(Buffer.from('{}'), 'bad'),
      ).rejects.toThrow(UnauthorizedException);
      expect(subscriptionRepo.findOne).not.toHaveBeenCalled();
      expect(subscriptionRepo.save).not.toHaveBeenCalled();
    });

    it('activates the subscription and records the payment on subscription.charged', async () => {
      const subscription = localSubscription();
      razorpay.verifyWebhook.mockReturnValue({
        event: 'subscription.charged',
        payload: {
          subscription: {
            entity: {
              id: 'sub_rzp',
              status: 'active',
              current_start: 1_700_000_000,
              current_end: 1_702_592_000,
            },
          },
          payment: {
            entity: {
              id: 'pay_1',
              amount: 49900,
              currency: 'inr',
              method: 'upi',
              subscription_id: 'sub_rzp',
            },
          },
        },
      });
      subscriptionRepo.findOne.mockResolvedValue(subscription);
      paymentRepo.findOne.mockResolvedValue(null);

      await service.handleRazorpayWebhook(Buffer.from('{}'), 'sig');

      expect(subscriptionRepo.findOne).toHaveBeenCalledWith({
        where: { provider: 'razorpay', provider_subscription_id: 'sub_rzp' },
      });
      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          is_free_trial: false,
          current_period_start: new Date(1_700_000_000 * 1000),
          current_period_end: new Date(1_702_592_000 * 1000),
        }),
      );
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_id: 'sub-local',
          provider: 'razorpay',
          provider_payment_id: 'pay_1',
          amount: 49900,
          currency: 'INR',
          status: 'succeeded',
          method: 'upi',
        }),
      );
    });

    it('marks the subscription past_due on payment.failed', async () => {
      razorpay.verifyWebhook.mockReturnValue({
        event: 'payment.failed',
        payload: {
          payment: {
            entity: { id: 'pay_2', amount: 49900, subscription_id: 'sub_rzp' },
          },
        },
      });
      subscriptionRepo.findOne.mockResolvedValue({
        ...localSubscription(),
        status: 'active',
      });
      paymentRepo.findOne.mockResolvedValue(null);

      await service.handleRazorpayWebhook(Buffer.from('{}'), 'sig');

      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'past_due' }),
      );
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          provider_payment_id: 'pay_2',
          status: 'failed',
        }),
      );
    });

    it('stamps cancelled_at once when the provider cancels', async () => {
      razorpay.verifyWebhook.mockReturnValue({
        event: 'subscription.cancelled',
        payload: {
          subscription: { entity: { id: 'sub_rzp', status: 'cancelled' } },
        },
      });
      subscriptionRepo.findOne.mockResolvedValue(localSubscription());

      await service.handleRazorpayWebhook(Buffer.from('{}'), 'sig');

      const saved = subscriptionRepo.save.mock.calls[0][0];
      expect(saved.status).toBe('cancelled');
      expect(saved.cancelled_at).toBeInstanceOf(Date);
    });

    it('is idempotent for a replayed payment id', async () => {
      razorpay.verifyWebhook.mockReturnValue({
        event: 'subscription.charged',
        payload: {
          payment: { entity: { id: 'pay_1', subscription_id: 'sub_rzp' } },
        },
      });
      subscriptionRepo.findOne.mockResolvedValue(localSubscription());
      const existing = { id: 'payment-row', status: 'failed' };
      paymentRepo.findOne.mockResolvedValue(existing);

      await service.handleRazorpayWebhook(Buffer.from('{}'), 'sig');

      expect(paymentRepo.create).not.toHaveBeenCalled();
      expect(paymentRepo.save).toHaveBeenCalledTimes(1);
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'payment-row', status: 'succeeded' }),
      );
    });

    it('ignores events for subscriptions it does not know about', async () => {
      razorpay.verifyWebhook.mockReturnValue({
        event: 'subscription.charged',
        payload: { subscription: { entity: { id: 'sub_unknown' } } },
      });
      subscriptionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.handleRazorpayWebhook(Buffer.from('{}'), 'sig'),
      ).resolves.toEqual({ received: true });
      expect(subscriptionRepo.save).not.toHaveBeenCalled();
      expect(paymentRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('handleStripeWebhook', () => {
    const stripeSubscription = () =>
      ({
        id: 'sub-local',
        provider: 'stripe',
        provider_subscription_id: 'sub_stripe',
        status: 'past_due',
        is_free_trial: true,
        cancelled_at: null,
      }) as unknown as Subscription;

    it('does not touch the database when the signature is invalid', async () => {
      stripe.verifyWebhook.mockImplementation(() => {
        throw new UnauthorizedException();
      });

      await expect(
        service.handleStripeWebhook(Buffer.from('{}'), 'bad'),
      ).rejects.toThrow(UnauthorizedException);
      expect(subscriptionRepo.findOne).not.toHaveBeenCalled();
    });

    it('activates the subscription and records a payment on invoice.paid', async () => {
      stripe.verifyWebhook.mockReturnValue({
        type: 'invoice.paid',
        data: {
          object: {
            id: 'in_1',
            amount_paid: 1999,
            amount_due: 1999,
            currency: 'usd',
            period_start: 1_700_000_000,
            period_end: 1_702_592_000,
            parent: { subscription_details: { subscription: 'sub_stripe' } },
          },
        },
      });
      subscriptionRepo.findOne.mockResolvedValue(stripeSubscription());
      paymentRepo.findOne.mockResolvedValue(null);

      await service.handleStripeWebhook(Buffer.from('{}'), 'sig');

      expect(subscriptionRepo.findOne).toHaveBeenCalledWith({
        where: { provider: 'stripe', provider_subscription_id: 'sub_stripe' },
      });
      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active', is_free_trial: false }),
      );
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'stripe',
          provider_payment_id: 'in_1',
          amount: 1999,
          currency: 'USD',
          status: 'succeeded',
          method: 'card',
        }),
      );
    });

    it('marks past_due and records a failed payment on invoice.payment_failed', async () => {
      stripe.verifyWebhook.mockReturnValue({
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_2',
            amount_paid: 0,
            amount_due: 1999,
            currency: 'usd',
            parent: { subscription_details: { subscription: 'sub_stripe' } },
          },
        },
      });
      subscriptionRepo.findOne.mockResolvedValue({
        ...stripeSubscription(),
        status: 'active',
      });
      paymentRepo.findOne.mockResolvedValue(null);

      await service.handleStripeWebhook(Buffer.from('{}'), 'sig');

      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'past_due' }),
      );
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 1999, status: 'failed' }),
      );
    });

    it('maps customer.subscription.deleted to cancelled', async () => {
      stripe.verifyWebhook.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: { id: 'sub_stripe', status: 'canceled', items: { data: [] } },
        },
      });
      subscriptionRepo.findOne.mockResolvedValue(stripeSubscription());

      await service.handleStripeWebhook(Buffer.from('{}'), 'sig');

      const saved = subscriptionRepo.save.mock.calls[0][0];
      expect(saved.status).toBe('cancelled');
      expect(saved.cancelled_at).toBeInstanceOf(Date);
    });

    it('acknowledges unhandled event types without side effects', async () => {
      stripe.verifyWebhook.mockReturnValue({
        type: 'charge.refunded',
        data: { object: {} },
      });

      await expect(
        service.handleStripeWebhook(Buffer.from('{}'), 'sig'),
      ).resolves.toEqual({ received: true });
      expect(subscriptionRepo.findOne).not.toHaveBeenCalled();
    });
  });
});
