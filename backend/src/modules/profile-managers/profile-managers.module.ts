import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileManagersController } from './profile-managers.controller';
import { ProfileManagersService } from './profile-managers.service';
import { ProfileManager } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileManager])],
  controllers: [ProfileManagersController],
  providers: [ProfileManagersService],
  exports: [ProfileManagersService],
})
export class ProfileManagersModule {}
