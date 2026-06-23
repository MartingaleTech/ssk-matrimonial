import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from './dto';
import { CurrentManager } from '../../common/decorators';
import { ProfileAccessGuard } from '../../guards/profile-access.guard';
import { ProfileManager } from '../../database/entities';

@Controller('profiles/:id/preferences')
@UseGuards(ProfileAccessGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  findOne(@Param('id') profileId: string) {
    return this.preferencesService.findOne(profileId);
  }

  @Patch()
  update(
    @Param('id') profileId: string,
    @Body() dto: UpdatePreferencesDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.preferencesService.update(profileId, dto, manager);
  }
}
