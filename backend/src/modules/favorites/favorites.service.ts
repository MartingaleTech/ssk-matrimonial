import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite, Profile, ProfileManager } from '../../database/entities';
import { EntitlementsService } from '../subscriptions/entitlements.service';
import { CreateFavoriteDto } from './dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(ProfileManager)
    private managerRepo: Repository<ProfileManager>,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async create(dto: CreateFavoriteDto, userId: string) {
    await this.assertManager(userId, dto.profile_id);
    await this.entitlementsService.assertPremium(dto.profile_id, 'Favorites');

    if (dto.profile_id === dto.favorited_profile_id) {
      throw new BadRequestException('Cannot favorite your own profile');
    }

    const target = await this.profileRepo.findOne({
      where: { id: dto.favorited_profile_id },
    });
    if (!target) {
      throw new NotFoundException('Profile not found');
    }

    const existing = await this.favoriteRepo.findOne({
      where: {
        profile_id: dto.profile_id,
        favorited_profile_id: dto.favorited_profile_id,
      },
    });
    if (existing) {
      throw new ConflictException('Profile is already favorited');
    }

    return this.favoriteRepo.save(this.favoriteRepo.create(dto));
  }

  async remove(favoritedProfileId: string, profileId: string, userId: string) {
    if (!profileId) {
      throw new BadRequestException('profile_id is required');
    }
    await this.assertManager(userId, profileId);

    const favorite = await this.favoriteRepo.findOne({
      where: {
        profile_id: profileId,
        favorited_profile_id: favoritedProfileId,
      },
    });
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepo.remove(favorite);
    return { message: 'Favorite removed' };
  }

  async findAll(profileId: string, userId: string) {
    if (!profileId) {
      throw new BadRequestException('profile_id is required');
    }
    await this.assertManager(userId, profileId);
    await this.entitlementsService.assertPremium(profileId, 'Favorites');

    return this.favoriteRepo.find({
      where: { profile_id: profileId },
      relations: ['favorited_profile'],
      select: {
        id: true,
        profile_id: true,
        favorited_profile_id: true,
        created_at: true,
        favorited_profile: {
          id: true,
          display_name: true,
          gender: true,
          height_cm: true,
          marital_status: true,
        },
      },
      order: { created_at: 'DESC' },
    });
  }

  private async assertManager(
    userId: string,
    profileId: string,
  ): Promise<ProfileManager> {
    const manager = await this.managerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });
    if (!manager) {
      throw new ForbiddenException('You are not a manager of this profile');
    }
    return manager;
  }
}
