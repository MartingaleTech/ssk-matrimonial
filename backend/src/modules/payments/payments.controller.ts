import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

/** Provider webhooks are signature-verified and retried, so they are not rate limited. */
@SkipThrottle()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  stripeWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleStripeWebhook(
      this.getRawBody(req),
      signature,
    );
  }

  @Public()
  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  razorpayWebhook(
    @Req() req: RawBodyRequest,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleRazorpayWebhook(
      this.getRawBody(req),
      signature,
    );
  }

  /** Signature verification needs the exact bytes the provider signed. */
  private getRawBody(req: RawBodyRequest): Buffer {
    if (!req.rawBody) {
      throw new BadRequestException('Raw request body is unavailable');
    }
    return req.rawBody;
  }
}
