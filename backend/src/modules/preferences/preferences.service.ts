import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProfilePartnerPreferences,
  ProfileManager,
} from '../../database/entities';
import { UpdatePreferencesDto } from './dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(ProfilePartnerPreferences)
    private prefRepo: Repository<ProfilePartnerPreferences>,
  ) {}

  async findOne(profileId: string) {
    const prefs = await this.prefRepo.findOne({
      where: { profile_id: profileId },
    });
    if (!prefs) {
      throw new NotFoundException('Preferences not found');
    }
    return prefs;
  }

  async update(
    profileId: string,
    dto: UpdatePreferencesDto,
    manager: ProfileManager,
  ) {
    if (manager.role !== 'owner' && manager.role !== 'parent') {
      throw new ForbiddenException(
        'Only owner or parent can update preferences',
      );
    }

    let prefs = await this.prefRepo.findOne({
      where: { profile_id: profileId },
    });
    if (!prefs) {
      prefs = this.prefRepo.create({ profile_id: profileId });
    }
    Object.assign(prefs, dto);
    return this.prefRepo.save(prefs);
  }
}
