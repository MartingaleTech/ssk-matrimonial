import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { ProfilePhoto, ProfileManager } from '../../database/entities';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfilePhoto, ProfileManager]),
    SubscriptionsModule,
    StorageModule,
  ],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
