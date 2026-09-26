import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { RazorpayService } from './razorpay.service';

const WEBHOOK_SECRET = 'rzp_whsec_test';

function configWith(values: Record<string, string | undefined>) {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

function sign(payload: Buffer, secret = WEBHOOK_SECRET) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

describe('RazorpayService.verifyWebhook', () => {
  const payload = Buffer.from(
    JSON.stringify({ event: 'subscription.charged', payload: {} }),
  );

  it('rejects when the webhook secret is not configured', () => {
    const service = new RazorpayService(configWith({}));
    expect(() => service.verifyWebhook(payload, sign(payload))).toThrow(
      ServiceUnavailableException,
    );
  });

  describe('with a configured secret', () => {
    let service: RazorpayService;

    beforeEach(() => {
      service = new RazorpayService(
        configWith({ 'payments.razorpay.webhookSecret': WEBHOOK_SECRET }),
      );
    });

    it('rejects a missing signature header', () => {
      expect(() => service.verifyWebhook(payload, undefined)).toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a signature produced with a different secret', () => {
      expect(() =>
        service.verifyWebhook(payload, sign(payload, 'other')),
      ).toThrow(UnauthorizedException);
    });

    it('rejects a valid signature for a different body', () => {
      const other = Buffer.from(JSON.stringify({ event: 'payment.failed' }));
      expect(() => service.verifyWebhook(other, sign(payload))).toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a signature of the wrong length without throwing internally', () => {
      expect(() => service.verifyWebhook(payload, 'abc')).toThrow(
        UnauthorizedException,
      );
    });

    it('returns the parsed body for a valid signature', () => {
      expect(service.verifyWebhook(payload, sign(payload))).toEqual({
        event: 'subscription.charged',
        payload: {},
      });
    });
  });
});
