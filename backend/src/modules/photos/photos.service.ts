import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfilePhoto, ProfileManager } from '../../database/entities';
import { EntitlementsService } from '../subscriptions/entitlements.service';
import { CreatePhotoDto, UpdatePhotoDto } from './dto';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(ProfilePhoto)
    private photoRepo: Repository<ProfilePhoto>,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async create(
    profileId: string,
    dto: CreatePhotoDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);

    const limit = await this.entitlementsService.getPhotoLimit(profileId);
    const count = await this.photoRepo.count({
      where: { profile_id: profileId },
    });
    if (count >= limit) {
      throw new BadRequestException(
        `Photo limit reached (${limit}). Upgrade to premium for more photo slots.`,
      );
    }

    if (dto.is_primary) {
      await this.photoRepo.update(
        { profile_id: profileId, is_primary: true },
        { is_primary: false },
      );
    }

    const photo = this.photoRepo.create({
      profile_id: profileId,
      ...dto,
    });
    return this.photoRepo.save(photo);
  }

  async findAll(profileId: string, manager?: ProfileManager) {
    const photos = await this.photoRepo.find({
      where: { profile_id: profileId },
      order: { created_at: 'DESC' },
    });

    if (
      manager &&
      !['owner', 'parent', 'family_member'].includes(manager.role)
    ) {
      return photos.filter((p) => p.visibility === 'public');
    }

    return photos;
  }

  async update(
    profileId: string,
    photoId: string,
    dto: UpdatePhotoDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);

    const photo = await this.photoRepo.findOne({
      where: { id: photoId, profile_id: profileId },
    });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (dto.is_primary) {
      await this.photoRepo.update(
        { profile_id: profileId, is_primary: true },
        { is_primary: false },
      );
    }

    Object.assign(photo, dto);
    return this.photoRepo.save(photo);
  }

  async remove(profileId: string, photoId: string, manager: ProfileManager) {
    this.assertOwnerOrParent(manager);

    const photo = await this.photoRepo.findOne({
      where: { id: photoId, profile_id: profileId },
    });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.photoRepo.remove(photo);
    return { message: 'Photo deleted' };
  }

  private assertOwnerOrParent(manager: ProfileManager): void {
    if (manager.role !== 'owner' && manager.role !== 'parent') {
      throw new ForbiddenException('Only owner or parent can manage photos');
    }
  }
}
