import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { Favorite, Profile, ProfileManager } from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite, Profile, ProfileManager]),
    SubscriptionsModule,
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
