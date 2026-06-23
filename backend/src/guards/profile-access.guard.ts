import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileManager } from '../database/entities';

@Injectable()
export class ProfileAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(ProfileManager)
    private profileManagerRepo: Repository<ProfileManager>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const profileId = request.params?.id;

    if (!userId || !profileId) {
      throw new ForbiddenException('Access denied');
    }

    const manager = await this.profileManagerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });

    if (!manager) {
      throw new ForbiddenException('You are not a manager of this profile');
    }

    request.manager = manager;
    return true;
  }
}
