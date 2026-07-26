import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto';
import { CurrentUser } from '../../common/decorators';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  create(@Body() dto: CreateFavoriteDto, @CurrentUser('id') userId: string) {
    return this.favoritesService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('profile_id') profileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.favoritesService.findAll(profileId, userId);
  }

  @Delete(':favoritedProfileId')
  remove(
    @Param('favoritedProfileId') favoritedProfileId: string,
    @Query('profile_id') profileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.favoritesService.remove(favoritedProfileId, profileId, userId);
  }
}
