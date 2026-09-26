import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';

const WEBHOOK_SECRET = 'whsec_test_secret';

function configWith(values: Record<string, string | undefined>) {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

describe('StripeService.verifyWebhook', () => {
  const payload = Buffer.from(
    JSON.stringify({
      id: 'evt_1',
      object: 'event',
      type: 'invoice.paid',
      data: { object: { id: 'in_1', object: 'invoice' } },
    }),
  );

  const header = (secret = WEBHOOK_SECRET, timestamp?: number) =>
    Stripe.webhooks.generateTestHeaderString({
      payload: payload.toString('utf8'),
      secret,
      timestamp,
    });

  it('rejects when the webhook secret is not configured', () => {
    const service = new StripeService(
      configWith({ 'payments.stripe.secretKey': 'sk_test_x' }),
    );
    expect(() => service.verifyWebhook(payload, header())).toThrow(
      ServiceUnavailableException,
    );
  });

  it('rejects when Stripe itself is not configured', () => {
    const service = new StripeService(
      configWith({ 'payments.stripe.webhookSecret': WEBHOOK_SECRET }),
    );
    expect(() => service.verifyWebhook(payload, header())).toThrow(
      ServiceUnavailableException,
    );
  });

  describe('when fully configured', () => {
    let service: StripeService;

    beforeEach(() => {
      service = new StripeService(
        configWith({
          'payments.stripe.secretKey': 'sk_test_x',
          'payments.stripe.webhookSecret': WEBHOOK_SECRET,
        }),
      );
    });

    it('rejects a missing signature header', () => {
      expect(() => service.verifyWebhook(payload, undefined)).toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a signature made with another secret', () => {
      expect(() =>
        service.verifyWebhook(payload, header('whsec_other')),
      ).toThrow(Stripe.errors.StripeSignatureVerificationError);
    });

    it('rejects a stale signature (replay protection)', () => {
      const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
      expect(() =>
        service.verifyWebhook(payload, header(WEBHOOK_SECRET, tenMinutesAgo)),
      ).toThrow(Stripe.errors.StripeSignatureVerificationError);
    });

    it('returns the event for a valid signature', () => {
      const event = service.verifyWebhook(payload, header());
      expect(event.type).toBe('invoice.paid');
      expect(event.id).toBe('evt_1');
    });
  });
});
