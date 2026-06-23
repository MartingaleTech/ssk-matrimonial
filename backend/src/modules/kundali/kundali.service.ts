import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProfileKundali,
  GunaMatchResults,
  KundaliPreferences,
  Profile,
  ProfileManager,
  ProfileSearchIndex,
  Block,
} from '../../database/entities';
import {
  GenerateKundaliDto,
  MatchKundaliDto,
  UploadKundaliDto,
  AiInterpretDto,
  UpdateKundaliPreferencesDto,
} from './dto';
import { generateKundali, computeGunaMatch } from './kundali-engine';

@Injectable()
export class KundaliService {
  constructor(
    @InjectRepository(ProfileKundali)
    private kundaliRepo: Repository<ProfileKundali>,
    @InjectRepository(GunaMatchResults)
    private gunaRepo: Repository<GunaMatchResults>,
    @InjectRepository(KundaliPreferences)
    private prefsRepo: Repository<KundaliPreferences>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(ProfileManager)
    private managerRepo: Repository<ProfileManager>,
    @InjectRepository(ProfileSearchIndex)
    private searchIndexRepo: Repository<ProfileSearchIndex>,
    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
  ) {}

  async generate(dto: GenerateKundaliDto, userId: string) {
    await this.assertOwnerOrParent(userId, dto.profile_id);

    const result = generateKundali(
      dto.birth_date,
      dto.birth_time,
      dto.latitude,
      dto.longitude,
      dto.timezone || '+05:30',
    );

    let kundali = await this.kundaliRepo.findOne({
      where: { profile_id: dto.profile_id },
    });
    if (!kundali) {
      kundali = this.kundaliRepo.create({ profile_id: dto.profile_id });
    }

    Object.assign(kundali, {
      birth_date: dto.birth_date,
      birth_time: dto.birth_time,
      birth_place: dto.birth_place,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone || '+05:30',
      ...result,
      kundali_generated: true,
      kundali_source: 'generated',
      generated_at: new Date(),
    });

    await this.kundaliRepo.save(kundali);
    await this.profileRepo.update(dto.profile_id, { has_kundali: true });
    await this.updateSearchIndex(dto.profile_id, result);

    return kundali;
  }

  async getKundali(profileId: string) {
    const kundali = await this.kundaliRepo.findOne({
      where: { profile_id: profileId },
    });
    if (!kundali) {
      throw new NotFoundException('Kundali not found');
    }
    return kundali;
  }

  async match(dto: MatchKundaliDto) {
    const k1 = await this.kundaliRepo.findOne({
      where: { profile_id: dto.profile1_id },
    });
    const k2 = await this.kundaliRepo.findOne({
      where: { profile_id: dto.profile2_id },
    });

    if (!k1 || !k1.kundali_generated) {
      throw new BadRequestException(
        'Profile 1 does not have a generated kundali',
      );
    }
    if (!k2 || !k2.kundali_generated) {
      throw new BadRequestException(
        'Profile 2 does not have a generated kundali',
      );
    }

    const result = computeGunaMatch(
      k1.rashi,
      k1.nakshatra,
      k2.rashi,
      k2.nakshatra,
    );

    const [p1, p2] = [dto.profile1_id, dto.profile2_id].sort();

    let gunaResult = await this.gunaRepo.findOne({
      where: { profile1_id: p1, profile2_id: p2 },
    });

    if (!gunaResult) {
      gunaResult = this.gunaRepo.create({
        profile1_id: p1,
        profile2_id: p2,
      });
    }

    Object.assign(gunaResult, {
      guna_total_score: result.guna_total_score,
      guna_breakdown: result.guna_breakdown,
      match_quality: result.match_quality,
      generated_at: new Date(),
    });

    await this.gunaRepo.save(gunaResult);
    return gunaResult;
  }

  async getMatchResults(profileId: string) {
    return this.gunaRepo.find({
      where: [{ profile1_id: profileId }, { profile2_id: profileId }],
      order: { guna_total_score: 'DESC' },
    });
  }

  async getSummary(profileId: string) {
    const kundali = await this.kundaliRepo.findOne({
      where: { profile_id: profileId },
    });
    if (!kundali) {
      throw new NotFoundException('Kundali not found');
    }

    return {
      profile_id: profileId,
      rashi: kundali.rashi,
      nakshatra: kundali.nakshatra,
      lagna: kundali.lagna,
      manglik_status: kundali.manglik_status,
      kundali_generated: kundali.kundali_generated,
      doshas: kundali.doshas,
    };
  }

  async aiInterpret(dto: AiInterpretDto) {
    const kundali = await this.kundaliRepo.findOne({
      where: { profile_id: dto.profile_id },
    });
    if (!kundali) {
      throw new NotFoundException('Kundali not found for profile');
    }

    // AI interpretation placeholder
    const interpretation = {
      profile_id: dto.profile_id,
      rashi_analysis: `The native has ${kundali.rashi} Moon sign, indicating certain personality traits and life tendencies.`,
      nakshatra_analysis: `Born under ${kundali.nakshatra} nakshatra, the native possesses specific qualities.`,
      manglik_analysis:
        kundali.manglik_status === 'manglik'
          ? 'The native is Manglik. Appropriate remedies or matching with another Manglik is recommended.'
          : 'The native is non-Manglik.',
      overall_summary: `Overall kundali analysis for ${kundali.rashi} rashi and ${kundali.nakshatra} nakshatra.`,
    };

    if (dto.match_profile_id) {
      const [p1, p2] = [dto.profile_id, dto.match_profile_id].sort();
      const gunaResult = await this.gunaRepo.findOne({
        where: { profile1_id: p1, profile2_id: p2 },
      });
      if (gunaResult) {
        const aiSummary = `Guna match score: ${gunaResult.guna_total_score}/36. Match quality: ${gunaResult.match_quality}.`;
        gunaResult.ai_summary = aiSummary;
        await this.gunaRepo.save(gunaResult);
        return { ...interpretation, match_analysis: aiSummary };
      }
    }

    return interpretation;
  }

  async updatePreferences(
    profileId: string,
    dto: UpdateKundaliPreferencesDto,
    userId: string,
  ) {
    await this.assertOwnerOrParent(userId, profileId);

    let prefs = await this.prefsRepo.findOne({
      where: { profile_id: profileId },
    });
    if (!prefs) {
      prefs = this.prefsRepo.create({ profile_id: profileId });
    }
    Object.assign(prefs, dto);
    return this.prefsRepo.save(prefs);
  }

  async searchByKundali(query: Record<string, string>) {
    const qb = this.searchIndexRepo
      .createQueryBuilder('si')
      .innerJoinAndSelect('si.profile', 'profile')
      .where('profile.profile_status = :status', { status: 'active' })
      .andWhere('profile.has_kundali = :has', { has: true });

    if (query.rashi) qb.andWhere('si.rashi = :rashi', { rashi: query.rashi });
    if (query.nakshatra)
      qb.andWhere('si.nakshatra = :nakshatra', { nakshatra: query.nakshatra });
    if (query.manglik_status)
      qb.andWhere('si.manglik_status = :ms', { ms: query.manglik_status });
    if (query.guna_min)
      qb.andWhere('si.guna_total_score >= :gmin', {
        gmin: parseFloat(query.guna_min),
      });
    if (query.kundali_required === 'true')
      qb.andWhere('profile.has_kundali = true');

    if (query.profile_id) {
      const blockedIds = await this.getBlockedProfileIds(query.profile_id);
      if (blockedIds.length > 0) {
        qb.andWhere('si.profile_id NOT IN (:...blocked)', {
          blocked: blockedIds,
        });
      }
      qb.andWhere('si.profile_id != :pid', { pid: query.profile_id });
    }

    const results = await qb.getMany();
    return { results, total: results.length };
  }

  async upload(dto: UploadKundaliDto, userId: string) {
    await this.assertOwnerOrParent(userId, dto.profile_id);

    let kundali = await this.kundaliRepo.findOne({
      where: { profile_id: dto.profile_id },
    });
    if (!kundali) {
      kundali = this.kundaliRepo.create({ profile_id: dto.profile_id });
    }

    const data = { ...dto };
    delete (data as Record<string, unknown>).profile_id;
    Object.assign(kundali, data, {
      kundali_generated: true,
      kundali_source: 'uploaded',
      generated_at: new Date(),
    });

    await this.kundaliRepo.save(kundali);
    await this.profileRepo.update(dto.profile_id, { has_kundali: true });

    if (kundali.rashi || kundali.nakshatra || kundali.manglik_status) {
      await this.updateSearchIndex(dto.profile_id, {
        rashi: kundali.rashi,
        nakshatra: kundali.nakshatra,
        manglik_status: kundali.manglik_status,
      });
    }

    return kundali;
  }

  async deleteKundali(profileId: string, userId: string) {
    await this.assertOwnerOrParent(userId, profileId);

    const kundali = await this.kundaliRepo.findOne({
      where: { profile_id: profileId },
    });
    if (!kundali) {
      throw new NotFoundException('Kundali not found');
    }

    await this.kundaliRepo.remove(kundali);
    await this.profileRepo.update(profileId, { has_kundali: false });

    await this.searchIndexRepo.update(
      { profile_id: profileId },
      { rashi: undefined, nakshatra: undefined, manglik_status: undefined },
    );

    return { message: 'Kundali deleted' };
  }

  private async assertOwnerOrParent(
    userId: string,
    profileId: string,
  ): Promise<ProfileManager> {
    const manager = await this.managerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });
    if (!manager || (manager.role !== 'owner' && manager.role !== 'parent')) {
      throw new ForbiddenException('Only owner or parent can manage kundali');
    }
    return manager;
  }

  private async updateSearchIndex(
    profileId: string,
    data: { rashi?: string; nakshatra?: string; manglik_status?: string },
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
