import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import {
  ProfileSearchIndex,
  Block,
  Profile,
  Connection,
  ProfilePartnerPreferences,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileSearchIndex,
      Block,
      Profile,
      Connection,
      ProfilePartnerPreferences,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
