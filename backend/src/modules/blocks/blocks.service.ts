import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block, ProfileManager } from '../../database/entities';
import { CreateBlockDto } from './dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
    @InjectRepository(ProfileManager)
    private managerRepo: Repository<ProfileManager>,
  ) {}

  async create(dto: CreateBlockDto, userId: string) {
    const manager = await this.managerRepo.findOne({
      where: { user_id: userId, profile_id: dto.blocked_by_profile_id },
    });
    if (!manager || (manager.role !== 'owner' && manager.role !== 'parent')) {
      throw new ForbiddenException('Only owner or parent can block profiles');
    }

    const existing = await this.blockRepo.findOne({
      where: {
        blocked_by_profile_id: dto.blocked_by_profile_id,
        blocked_profile_id: dto.blocked_profile_id,
      },
    });
    if (existing) {
      throw new ConflictException('Profile already blocked');
    }

    const block = this.blockRepo.create(dto);
    return this.blockRepo.save(block);
  }

  async remove(id: string, userId: string) {
    const block = await this.blockRepo.findOne({ where: { id } });
    if (!block) {
      throw new NotFoundException('Block not found');
    }

    const manager = await this.managerRepo.findOne({
      where: { user_id: userId, profile_id: block.blocked_by_profile_id },
    });
    if (!manager || (manager.role !== 'owner' && manager.role !== 'parent')) {
      throw new ForbiddenException('Only owner or parent can unblock profiles');
    }

    await this.blockRepo.remove(block);
    return { message: 'Profile unblocked' };
  }
}
