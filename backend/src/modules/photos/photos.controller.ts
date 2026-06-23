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
import { PhotosService } from './photos.service';
import { CreatePhotoDto, UpdatePhotoDto } from './dto';
import { CurrentManager } from '../../common/decorators';
import { ProfileAccessGuard } from '../../guards/profile-access.guard';
import { ProfileManager } from '../../database/entities';

@Controller('profiles/:id/photos')
@UseGuards(ProfileAccessGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  create(
    @Param('id') profileId: string,
    @Body() dto: CreatePhotoDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.photosService.create(profileId, dto, manager);
  }

  @Get()
  findAll(
    @Param('id') profileId: string,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.photosService.findAll(profileId, manager);
  }

  @Patch(':photoId')
  update(
    @Param('id') profileId: string,
    @Param('photoId') photoId: string,
    @Body() dto: UpdatePhotoDto,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.photosService.update(profileId, photoId, dto, manager);
  }

  @Delete(':photoId')
  remove(
    @Param('id') profileId: string,
    @Param('photoId') photoId: string,
    @CurrentManager() manager: ProfileManager,
  ) {
    return this.photosService.remove(profileId, photoId, manager);
  }
}
