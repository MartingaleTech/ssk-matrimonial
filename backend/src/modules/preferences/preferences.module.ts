import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferencesController } from './preferences.controller';
import { PreferencesService } from './preferences.service';
import {
  ProfilePartnerPreferences,
  ProfileManager,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfilePartnerPreferences, ProfileManager]),
  ],
  controllers: [PreferencesController],
  providers: [PreferencesService],
  exports: [PreferencesService],
})
export class PreferencesModule {}
