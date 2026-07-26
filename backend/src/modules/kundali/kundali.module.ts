import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KundaliController } from './kundali.controller';
import { KundaliService } from './kundali.service';
import {
  ProfileKundali,
  GunaMatchResults,
  KundaliPreferences,
  Profile,
  ProfileManager,
  ProfileSearchIndex,
  Block,
} from '../../database/entities';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    SubscriptionsModule,
    TypeOrmModule.forFeature([
      ProfileKundali,
      GunaMatchResults,
      KundaliPreferences,
      Profile,
      ProfileManager,
      ProfileSearchIndex,
      Block,
    ]),
  ],
  controllers: [KundaliController],
  providers: [KundaliService],
  exports: [KundaliService],
})
export class KundaliModule {}
