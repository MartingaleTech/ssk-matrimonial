import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { EntitlementsService } from './entitlements.service';
import { PaymentsModule } from '../payments/payments.module';
import {
  PlanPrice,
  Profile,
  ProfileLocation,
  ProfileManager,
  Subscription,
  SubscriptionPlan,
  User,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      PlanPrice,
      Subscription,
      Profile,
      ProfileLocation,
      ProfileManager,
      User,
    ]),
    PaymentsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, EntitlementsService],
  exports: [SubscriptionsService, EntitlementsService],
})
export class SubscriptionsModule {}
