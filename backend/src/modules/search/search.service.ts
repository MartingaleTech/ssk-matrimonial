import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProfileSearchIndex,
  Block,
  Profile,
  Connection,
  ProfilePartnerPreferences,
} from '../../database/entities';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(ProfileSearchIndex)
    private searchIndexRepo: Repository<ProfileSearchIndex>,
    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(Connection)
    private connectionRepo: Repository<Connection>,
    @InjectRepository(ProfilePartnerPreferences)
    private prefRepo: Repository<ProfilePartnerPreferences>,
  ) {}

  async search(query: Record<string, string>, currentProfileId?: string) {
    const qb = this.searchIndexRepo
      .createQueryBuilder('si')
      .innerJoinAndSelect('si.profile', 'profile')
      .where('profile.profile_status = :status', { status: 'active' });

    if (query.gender)
      qb.andWhere('si.gender = :gender', { gender: query.gender });
    if (query.age_min)
      qb.andWhere('si.age >= :ageMin', { ageMin: parseInt(query.age_min) });
    if (query.age_max)
      qb.andWhere('si.age <= :ageMax', { ageMax: parseInt(query.age_max) });
    if (query.height_min)
      qb.andWhere('si.height_cm >= :hMin', {
        hMin: parseInt(query.height_min),
      });
    if (query.height_max)
      qb.andWhere('si.height_cm <= :hMax', {
        hMax: parseInt(query.height_max),
      });
    if (query.marital_status)
      qb.andWhere('si.marital_status = :ms', { ms: query.marital_status });
    if (query.education_level)
      qb.andWhere('si.education_level = :el', { el: query.education_level });
    if (query.occupation)
      qb.andWhere('si.occupation = :occ', { occ: query.occupation });
    if (query.city) qb.andWhere('si.city = :city', { city: query.city });
    if (query.state) qb.andWhere('si.state = :state', { state: query.state });
    if (query.country)
      qb.andWhere('si.country = :country', { country: query.country });
    if (query.community)
      qb.andWhere('si.community = :community', { community: query.community });

    if (currentProfileId) {
      const blockedIds = await this.getBlockedProfileIds(currentProfileId);
      if (blockedIds.length > 0) {
        qb.andWhere('si.profile_id NOT IN (:...blockedIds)', { blockedIds });
      }
      qb.andWhere('si.profile_id != :currentId', {
        currentId: currentProfileId,
      });
    }

    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    qb.skip((page - 1) * limit).take(limit);

    const [results, total] = await qb.getManyAndCount();
    return { results, total, page, limit };
  }

  async getRecommended(profileId: string) {
    const prefs = await this.prefRepo.findOne({
      where: { profile_id: profileId },
    });
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });
    if (!profile) return { results: [], total: 0 };

    const qb = this.searchIndexRepo
      .createQueryBuilder('si')
      .innerJoinAndSelect('si.profile', 'profile')
      .where('profile.profile_status = :status', { status: 'active' })
      .andWhere('si.profile_id != :pid', { pid: profileId });

    // Opposite gender
    const oppositeGender = profile.gender === 'male' ? 'female' : 'male';
    qb.andWhere('si.gender = :g', { g: oppositeGender });

    if (prefs) {
      if (prefs.age_min)
        qb.andWhere('si.age >= :amin', { amin: prefs.age_min });
      if (prefs.age_max)
        qb.andWhere('si.age <= :amax', { amax: prefs.age_max });
      if (prefs.height_min_cm)
        qb.andWhere('si.height_cm >= :hmin', { hmin: prefs.height_min_cm });
      if (prefs.height_max_cm)
        qb.andWhere('si.height_cm <= :hmax', { hmax: prefs.height_max_cm });
    }

    const blockedIds = await this.getBlockedProfileIds(profileId);
    if (blockedIds.length > 0) {
      qb.andWhere('si.profile_id NOT IN (:...blocked)', {
        blocked: blockedIds,
      });
    }

    qb.take(50);
    const results = await qb.getMany();
    return { results, total: results.length };
  }

  async getTopMatches(profileId: string) {
    const blockedIds = await this.getBlockedProfileIds(profileId);
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });
    if (!profile) return { results: [], total: 0 };

    const oppositeGender = profile.gender === 'male' ? 'female' : 'male';

    const qb = this.searchIndexRepo
      .createQueryBuilder('si')
      .innerJoinAndSelect('si.profile', 'profile')
      .where('profile.profile_status = :status', { status: 'active' })
      .andWhere('si.gender = :g', { g: oppositeGender })
      .andWhere('si.profile_id != :pid', { pid: profileId });

    if (blockedIds.length > 0) {
      qb.andWhere('si.profile_id NOT IN (:...blocked)', {
        blocked: blockedIds,
      });
    }

    qb.orderBy('si.updated_at', 'DESC').take(20);
    const results = await qb.getMany();
    return { results, total: results.length };
  }

  private async getBlockedProfileIds(profileId: string): Promise<string[]> {
    const blocks = await this.blockRepo.find({
      where: [
        { blocked_by_profile_id: profileId },
        { blocked_profile_id: profileId },
      ],
    });
    const ids = new Set<string>();
    for (const b of blocks) {
      if (b.blocked_by_profile_id === profileId) ids.add(b.blocked_profile_id);
      else ids.add(b.blocked_by_profile_id);
    }
    return Array.from(ids);
  }
}
