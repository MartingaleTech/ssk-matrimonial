import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SubscriptionsService } from './subscriptions.service';
import { CancelSubscriptionDto, CheckoutDto } from './dto';
import { CurrentUser, Public } from '../../common/decorators';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Public()
  @Get('plans')
  listPlans(@Query('country') country?: string) {
    return this.subscriptionsService.listPlans(country);
  }

  @Get('me')
  getMine(
    @Query('profile_id') profileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.subscriptionsService.getMine(profileId, userId);
  }

  @Post('checkout')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  checkout(@Body() dto: CheckoutDto, @CurrentUser('id') userId: string) {
    return this.subscriptionsService.checkout(dto, userId);
  }

  @Post('cancel')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  cancel(
    @Body() dto: CancelSubscriptionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.subscriptionsService.cancel(dto, userId);
  }
}
