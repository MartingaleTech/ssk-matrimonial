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
import { ProfilesService } from './profiles.service';
import {
  CreateProfileDto,
  UpdateProfileDto,
  UpdateBasicDetailsDto,
  UpdateEducationCareerDto,
  UpdateFamilyInfoDto,
  UpdateLifestyleDto,
  UpdateLocationDto,
  UpdateKundaliDto,
} from './dto';
import { CurrentUser, CurrentManager } from '../../common/decorators';
import { ProfileAccessGuard } from '../../guards/profile-access.guard';
import { ProfileManager } from '../../database/entities';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  create(@Body() dto: CreateProfileDto, @CurrentUser('id') userId: string) {
    return this.profilesService.create(dto, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ProfileAccessGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.profilesService.update(id, dto, manager);
  }

  @Delete(':id')
  @UseGuards(ProfileAccessGuard)
  delete(@Param('id') id: string, @CurrentManager() manager: ProfileManager) {
    return this.profilesService.delete(id, manager);
  }

  @Patch(':id/basic')
  @UseGuards(ProfileAccessGuard)
  updateBasic(
    @Param('id') id: string,
    @Body() dto: UpdateBasicDetailsDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.profilesService.updateBasic(id, dto, manager);
  }

  @Patch(':id/education-career')
  @UseGuards(ProfileAccessGuard)
  updateEducationCareer(
    @Param('id') id: string,
    @Body() dto: UpdateEducationCareerDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.profilesService.updateEducationCareer(id, dto, manager);
  }

  @Patch(':id/family-info')
  @UseGuards(ProfileAccessGuard)
  updateFamilyInfo(
    @Param('id') id: string,
    @Body() dto: UpdateFamilyInfoDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.profilesService.updateFamilyInfo(id, dto, manager);
  }

  @Patch(':id/lifestyle')
  @UseGuards(ProfileAccessGuard)
  updateLifestyle(
    @Param('id') id: string,
    @Body() dto: UpdateLifestyleDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.profilesService.updateLifestyle(id, dto, manager);
  }

  @Patch(':id/location')
  @UseGuards(ProfileAccessGuard)
  updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.profilesService.updateLocation(id, dto, manager);
  }

  @Patch(':id/kundali')
  @UseGuards(ProfileAccessGuard)
  updateKundali(
    @Param('id') id: string,
    @Body() dto: UpdateKundaliDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.profilesService.updateKundali(id, dto, manager);
  }
}
