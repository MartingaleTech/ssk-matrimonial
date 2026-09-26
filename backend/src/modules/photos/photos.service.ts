import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ProfilePhoto, ProfileManager } from '../../database/entities';
import { EntitlementsService } from '../subscriptions/entitlements.service';
import {
  StorageService,
  PRESIGNED_GET_EXPIRY_SECONDS,
} from '../storage/storage.service';
import {
  CreatePhotoDto,
  UpdatePhotoDto,
  PresignPhotoDto,
  ALLOWED_PHOTO_MIME_TYPES,
} from './dto';

const SIGNED_VISIBILITIES = ['private', 'connected_only'];

@Injectable()
export class PhotosService {
  private readonly logger = new Logger(PhotosService.name);

  constructor(
    @InjectRepository(ProfilePhoto)
    private photoRepo: Repository<ProfilePhoto>,
    private readonly entitlementsService: EntitlementsService,
    private readonly storageService: StorageService,
  ) {}

  async presign(
    profileId: string,
    dto: PresignPhotoDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);
    await this.assertPhotoSlotAvailable(profileId);

    const ext = ALLOWED_PHOTO_MIME_TYPES[dto.content_type];
    if (!ext) {
      throw new BadRequestException('Unsupported image type');
    }

    const storageKey = `profiles/${profileId}/${randomUUID()}.${ext}`;
    const uploadUrl = await this.storageService.createPresignedPut(
      storageKey,
      dto.content_type,
    );

    return {
      upload_url: uploadUrl,
      storage_key: storageKey,
      public_url: this.storageService.getPublicUrl(storageKey),
    };
  }

  async create(
    profileId: string,
    dto: CreatePhotoDto,
    manager: ProfileManager,
  ) {
    this.assertOwnerOrParent(manager);
    await this.assertPhotoSlotAvailable(profileId);

    if (
      dto.storage_key &&
      !dto.storage_key.startsWith(`profiles/${profileId}/`)
    ) {
      throw new BadRequestException(
        'storage_key does not belong to this profile',
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
    const saved = await this.photoRepo.save(photo);
    return this.withServingUrl(saved);
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
      return Promise.all(
        photos
          .filter((p) => p.visibility === 'public')
          .map((p) => this.withServingUrl(p)),
      );
    }

    return Promise.all(photos.map((p) => this.withServingUrl(p)));
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
    const saved = await this.photoRepo.save(photo);
    return this.withServingUrl(saved);
  }

  async remove(profileId: string, photoId: string, manager: ProfileManager) {
    this.assertOwnerOrParent(manager);

    const photo = await this.photoRepo.findOne({
      where: { id: photoId, profile_id: profileId },
    });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    const storageKey = photo.storage_key;
    await this.photoRepo.remove(photo);

    if (storageKey) {
      try {
        await this.storageService.deleteObject(storageKey);
      } catch (err) {
        this.logger.error(
          `Failed to delete object ${storageKey} from storage`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    }

    return { message: 'Photo deleted' };
  }

  /**
   * Resolves the URL a client should use to load the photo. Public photos are
   * served from the CDN domain; private/connected_only photos get a
   * short-lived presigned GET so the object is never reachable without passing
   * the permission checks in this service.
   */
  private async withServingUrl(photo: ProfilePhoto): Promise<ProfilePhoto> {
    if (!photo.storage_key) {
      return photo;
    }

    const url = SIGNED_VISIBILITIES.includes(photo.visibility)
      ? await this.storageService.createPresignedGet(
          photo.storage_key,
          PRESIGNED_GET_EXPIRY_SECONDS,
        )
      : this.storageService.getPublicUrl(photo.storage_key);

    return { ...photo, url };
  }

  private async assertPhotoSlotAvailable(profileId: string): Promise<void> {
    const limit = await this.entitlementsService.getPhotoLimit(profileId);
    const count = await this.photoRepo.count({
      where: { profile_id: profileId },
    });
    if (count >= limit) {
      throw new BadRequestException(
        `Photo limit reached (${limit}). Upgrade to premium for more photo slots.`,
      );
    }
  }

  private assertOwnerOrParent(manager: ProfileManager): void {
    if (manager.role !== 'owner' && manager.role !== 'parent') {
      throw new ForbiddenException('Only owner or parent can manage photos');
    }
  }
}
