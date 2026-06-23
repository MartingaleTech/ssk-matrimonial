import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import {
  Profile,
  ProfileManager,
  ProfileBasicDetails,
  ProfileEducationCareer,
  ProfileFamilyInfo,
  ProfileLifestyle,
  ProfileLocation,
  ProfileKundali,
  ProfilePrivacySettings,
  ProfileSearchIndex,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      ProfileManager,
      ProfileBasicDetails,
      ProfileEducationCareer,
      ProfileFamilyInfo,
      ProfileLifestyle,
      ProfileLocation,
      ProfileKundali,
      ProfilePrivacySettings,
      ProfileSearchIndex,
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
