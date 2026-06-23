import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { ProfilePhoto, ProfileManager } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProfilePhoto, ProfileManager])],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
