import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import {
  CreateProfileDto,
  UpdateProfileDto,
  UpdateBasicDetailsDto,
  UpdateEducationCareerDto,
  UpdateFamilyInfoDto,
  UpdateLifestyleDto,
  UpdateLocationDto,
  UpdateKundaliDto,
} from './dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(ProfileManager)
    private managerRepo: Repository<ProfileManager>,
    @InjectRepository(ProfileBasicDetails)
    private basicRepo: Repository<ProfileBasicDetails>,
    @InjectRepository(ProfileEducationCareer)
    private educationRepo: Repository<ProfileEducationCareer>,
    @InjectRepository(ProfileFamilyInfo)
    private familyRepo: Repository<ProfileFamilyInfo>,
    @InjectRepository(ProfileLifestyle)
    private lifestyleRepo: Repository<ProfileLifestyle>,
    @InjectRepository(ProfileLocation)
    private locationRepo: Repository<ProfileLocation>,
    @InjectRepository(ProfileKundali)
    private kundaliRepo: Repository<ProfileKundali>,
    @InjectRepository(ProfilePrivacySettings)
    private privacyRepo: Repository<ProfilePrivacySettings>,
    @InjectRepository(ProfileSearchIndex)
    private searchIndexRepo: Repository<ProfileSearchIndex>,
  ) {}

  async create(dto: CreateProfileDto, userId: string) {
    const profile = this.profileRepo.create(dto);
    await this.profileRepo.save(profile);

    const manager = this.managerRepo.create({
      user_id: userId,
      profile_id: profile.id,
      role: 'owner',
      is_primary: true,
    });
    await this.managerRepo.save(manager);

    // Initialize sub-tables
    await this.basicRepo.save(
      this.basicRepo.create({ profile_id: profile.id }),
    );
    await this.educationRepo.save(
      this.educationRepo.create({ profile_id: profile.id }),
    );
    await this.familyRepo.save(
      this.familyRepo.create({ profile_id: profile.id }),
    );
    await this.lifestyleRepo.save(
      this.lifestyleRepo.create({ profile_id: profile.id }),
    );
    await this.locationRepo.save(
      this.locationRepo.create({ profile_id: profile.id }),
    );
    await this.privacyRepo.save(
      this.privacyRepo.create({ profile_id: profile.id }),
    );
    await this.searchIndexRepo.save(
      this.searchIndexRepo.create({
        profile_id: profile.id,
        gender: profile.gender,
        marital_status: profile.marital_status,
        height_cm: profile.height_cm,
      }),
    );

    return { profile, manager };
  }

  async findByUser(userId: string) {
    const manager = await this.managerRepo.findOne({
      where: { user_id: userId },
      order: { is_primary: 'DESC' },
    });
    if (!manager) {
      return { profile: null, manager: null };
    }
    const profile = await this.findOne(manager.profile_id);
    return { profile, manager };
  }

  async findOne(id: string) {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: [
        'basic_details',
        'education_career',
        'family_info',
        'lifestyle',
        'location',
        'photos',
        'privacy_settings',
        'partner_preferences',
        'kundali',
        'kundali_preferences',
      ],
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async update(id: string, dto: UpdateProfileDto, manager: ProfileManager) {
    this.assertOwnerOrParent(manager);
    const profile = await this.getProfileOrFail(id);
    Object.assign(profile, dto);
    await this.profileRepo.save(profile);
    await this.updateSearchIndex(id, {
      gender: profile.gender,
      marital_status: profile.marital_status,
      height_cm: profile.height_cm,
    });
    return profile;
  }

  async delete(id: string, manager: ProfileManager) {
    this.assertOwnerOrParent(manager);
    await this.getProfileOrFail(id);
    await this.profileRepo.delete(id);
    return { message: 'Profile deleted' };
  }

  async updateBasic(
    id: string,
    dto: UpdateBasicDetailsDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);
    let basic = await this.basicRepo.findOne({ where: { profile_id: id } });
    if (!basic) {
      basic = this.basicRepo.create({ profile_id: id });
    }
    Object.assign(basic, dto);
    await this.basicRepo.save(basic);
    await this.updateSearchIndex(id, { community: basic.community });
    return basic;
  }

  async updateEducationCareer(
    id: string,
    dto: UpdateEducationCareerDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);
    let ec = await this.educationRepo.findOne({ where: { profile_id: id } });
    if (!ec) {
      ec = this.educationRepo.create({ profile_id: id });
    }
    Object.assign(ec, dto);
    await this.educationRepo.save(ec);
    await this.updateSearchIndex(id, {
      education_level: ec.highest_education,
      occupation: ec.occupation,
    });
    return ec;
  }

  async updateFamilyInfo(
    id: string,
    dto: UpdateFamilyInfoDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);
    let fi = await this.familyRepo.findOne({ where: { profile_id: id } });
    if (!fi) {
      fi = this.familyRepo.create({ profile_id: id });
    }
    Object.assign(fi, dto);
    await this.familyRepo.save(fi);
    return fi;
  }

  async updateLifestyle(
    id: string,
    dto: UpdateLifestyleDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);
    let ls = await this.lifestyleRepo.findOne({ where: { profile_id: id } });
    if (!ls) {
      ls = this.lifestyleRepo.create({ profile_id: id });
    }
    Object.assign(ls, dto);
    await this.lifestyleRepo.save(ls);
    return ls;
  }

  async updateLocation(
    id: string,
    dto: UpdateLocationDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);
    let loc = await this.locationRepo.findOne({ where: { profile_id: id } });
    if (!loc) {
      loc = this.locationRepo.create({ profile_id: id });
    }
    Object.assign(loc, dto);
    await this.locationRepo.save(loc);
    await this.updateSearchIndex(id, {
      city: loc.city,
      state: loc.state,
      country: loc.country,
    });
    return loc;
  }

  async updateKundali(
    id: string,
    dto: UpdateKundaliDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);
    let k = await this.kundaliRepo.findOne({ where: { profile_id: id } });
    if (!k) {
      k = this.kundaliRepo.create({ profile_id: id });
    }
    Object.assign(k, dto);
    await this.kundaliRepo.save(k);

    if (k.kundali_generated) {
      await this.profileRepo.update(id, { has_kundali: true });
      await this.updateSearchIndex(id, {
        manglik_status: k.manglik_status,
        rashi: k.rashi,
        nakshatra: k.nakshatra,
      });
    }
    return k;
  }

  private async getProfileOrFail(id: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  private assertOwnerOrParent(manager: ProfileManager): void {
    if (manager.role !== 'owner' && manager.role !== 'parent') {
      throw new ForbiddenException(
        'Only owner or parent can perform this action',
      );
    }
  }

  private async updateSearchIndex(
    profileId: string,
    data: Partial<ProfileSearchIndex>,
  ): Promise<void> {
    let idx = await this.searchIndexRepo.findOne({
      where: { profile_id: profileId },
    });
    if (!idx) {
      idx = this.searchIndexRepo.create({ profile_id: profileId });
    }
    Object.assign(idx, data);
    await this.searchIndexRepo.save(idx);
  }
}
