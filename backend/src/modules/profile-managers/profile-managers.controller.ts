import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProfileManagersService } from './profile-managers.service';
import { CreateManagerDto, UpdateManagerDto } from './dto';
import { CurrentManager } from '../../common/decorators';
import { ProfileAccessGuard } from '../../guards/profile-access.guard';
import { ProfileManager } from '../../database/entities';

@Controller('profiles/:id/managers')
@UseGuards(ProfileAccessGuard)
export class ProfileManagersController {
  constructor(private readonly service: ProfileManagersService) {}

  @Post()
  create(
    @Param('id') profileId: string,
    @Body() dto: CreateManagerDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.service.create(profileId, dto, manager);
  }

  @Get()
  findAll(@Param('id') profileId: string) {
    return this.service.findAll(profileId);
  }

  @Patch(':managerId')
  update(
    @Param('id') profileId: string,
    @Param('managerId') managerId: string,
    @Body() dto: UpdateManagerDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.service.update(profileId, managerId, dto, manager);
  }

  @Delete(':managerId')
  remove(
    @Param('id') profileId: string,
    @Param('managerId') managerId: string,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.service.remove(profileId, managerId, manager);
  }
}
