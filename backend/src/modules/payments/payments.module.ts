import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';
import { Payment, Subscription } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Subscription])],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, RazorpayService],
  exports: [StripeService, RazorpayService],
})
export class PaymentsModule {}
