import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileManager } from '../../database/entities';
import { CreateManagerDto, UpdateManagerDto } from './dto';

@Injectable()
export class ProfileManagersService {
  constructor(
    @InjectRepository(ProfileManager)
    private managerRepo: Repository<ProfileManager>,
  ) {}

  async create(
    profileId: string,
    dto: CreateManagerDto,
    currentManager: ProfileManager,
  ) {
    this.assertOwnerOrParent(currentManager);

    const existing = await this.managerRepo.findOne({
      where: { user_id: dto.user_id, profile_id: profileId },
    });
    if (existing) {
      throw new ConflictException('User is already a manager of this profile');
    }

    const manager = this.managerRepo.create({
      user_id: dto.user_id,
      profile_id: profileId,
      role: dto.role,
      is_primary: false,
      added_by_manager_id: currentManager.id,
    });
    return this.managerRepo.save(manager);
  }

  async findAll(profileId: string) {
    return this.managerRepo.find({
      where: { profile_id: profileId },
      relations: ['user'],
    });
  }

  async update(
    profileId: string,
    managerId: string,
    dto: UpdateManagerDto,
    currentManager: ProfileManager,
  ) {
    this.assertOwnerOrParent(currentManager);

    const manager = await this.managerRepo.findOne({
      where: { id: managerId, profile_id: profileId },
    });
    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    if (manager.is_primary && dto.role && dto.role !== 'owner') {
      throw new ForbiddenException('Cannot change role of primary owner');
    }

    Object.assign(manager, dto);
    return this.managerRepo.save(manager);
  }

  async remove(
    profileId: string,
    managerId: string,
    currentManager: ProfileManager,
  ) {
    this.assertOwnerOrParent(currentManager);

    const manager = await this.managerRepo.findOne({
      where: { id: managerId, profile_id: profileId },
    });
    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    if (manager.is_primary) {
      throw new ForbiddenException('Cannot remove primary owner');
    }

    await this.managerRepo.remove(manager);
    return { message: 'Manager removed' };
  }

  private assertOwnerOrParent(manager: ProfileManager): void {
    if (manager.role !== 'owner' && manager.role !== 'parent') {
      throw new ForbiddenException('Only owner or parent can manage managers');
    }
  }
}
