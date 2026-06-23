import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection, Block, ProfileManager } from '../../database/entities';
import { CreateConnectionDto } from './dto';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(Connection)
    private connectionRepo: Repository<Connection>,
    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
    @InjectRepository(ProfileManager)
    private managerRepo: Repository<ProfileManager>,
  ) {}

  async create(dto: CreateConnectionDto, userId: string) {
    const manager = await this.managerRepo.findOne({
      where: { user_id: userId, profile_id: dto.from_profile_id },
    });
    if (!manager) {
      throw new ForbiddenException('You are not a manager of this profile');
    }
    if (manager.role !== 'owner' && manager.role !== 'parent') {
      throw new ForbiddenException('Only owner or parent can send connections');
    }

    if (dto.from_profile_id === dto.to_profile_id) {
      throw new BadRequestException('Cannot connect to yourself');
    }

    // Check blocks
    const block = await this.blockRepo.findOne({
      where: [
        {
          blocked_by_profile_id: dto.from_profile_id,
          blocked_profile_id: dto.to_profile_id,
        },
        {
          blocked_by_profile_id: dto.to_profile_id,
          blocked_profile_id: dto.from_profile_id,
        },
      ],
    });
    if (block) {
      throw new ForbiddenException('Cannot connect - profile is blocked');
    }

    const existing = await this.connectionRepo.findOne({
      where: [
        {
          from_profile_id: dto.from_profile_id,
          to_profile_id: dto.to_profile_id,
        },
        {
          from_profile_id: dto.to_profile_id,
          to_profile_id: dto.from_profile_id,
        },
      ],
    });
    if (existing) {
      throw new ConflictException('Connection already exists');
    }

    const connection = this.connectionRepo.create({
      from_profile_id: dto.from_profile_id,
      to_profile_id: dto.to_profile_id,
      status: 'pending',
      initiated_by_manager_id: manager.id,
      requested_at: new Date(),
      message: dto.message,
    });
    return this.connectionRepo.save(connection);
  }

  async accept(id: string, userId: string) {
    const connection = await this.getConnectionOrFail(id);
    await this.getOwnerOrParentManager(userId, connection.to_profile_id);

    if (connection.status !== 'pending') {
      throw new BadRequestException('Connection is not pending');
    }

    connection.status = 'accepted';
    connection.responded_at = new Date();
    return this.connectionRepo.save(connection);
  }

  async reject(id: string, userId: string) {
    const connection = await this.getConnectionOrFail(id);
    await this.getOwnerOrParentManager(userId, connection.to_profile_id);

    if (connection.status !== 'pending') {
      throw new BadRequestException('Connection is not pending');
    }

    connection.status = 'rejected';
    connection.responded_at = new Date();
    return this.connectionRepo.save(connection);
  }

  async cancel(id: string, userId: string) {
    const connection = await this.getConnectionOrFail(id);
    await this.getOwnerOrParentManager(userId, connection.from_profile_id);

    if (connection.status !== 'pending') {
      throw new BadRequestException('Connection is not pending');
    }

    connection.status = 'cancelled';
    connection.responded_at = new Date();
    return this.connectionRepo.save(connection);
  }

  async findAll(query: Record<string, string>, userId: string) {
    const profileId = query.profile_id;
    if (!profileId) {
      throw new BadRequestException('profile_id is required');
    }

    const manager = await this.managerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });
    if (!manager) {
      throw new ForbiddenException('You are not a manager of this profile');
    }

    const qb = this.connectionRepo
      .createQueryBuilder('c')
      .where('(c.from_profile_id = :pid OR c.to_profile_id = :pid)', {
        pid: profileId,
      });

    if (query.status) {
      qb.andWhere('c.status = :status', { status: query.status });
    }

    qb.orderBy('c.requested_at', 'DESC');
    return qb.getMany();
  }

  private async getConnectionOrFail(id: string): Promise<Connection> {
    const connection = await this.connectionRepo.findOne({ where: { id } });
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
    return connection;
  }

  private async getOwnerOrParentManager(
    userId: string,
    profileId: string,
  ): Promise<ProfileManager> {
    const manager = await this.managerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });
    if (!manager || (manager.role !== 'owner' && manager.role !== 'parent')) {
      throw new ForbiddenException(
        'Only owner or parent can manage connections',
      );
    }
    return manager;
  }
}
