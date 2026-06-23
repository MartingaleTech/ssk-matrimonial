import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileManager } from '../database/entities';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ProfileManager)
    private profileManagerRepo: Repository<ProfileManager>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const profileId =
      request.params?.id ||
      request.params?.profileId ||
      request.body?.profile_id;

    if (!userId || !profileId) {
      throw new ForbiddenException('Access denied');
    }

    const manager = await this.profileManagerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });

    if (!manager || !requiredRoles.includes(manager.role)) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    request.manager = manager;
    return true;
  }
}
