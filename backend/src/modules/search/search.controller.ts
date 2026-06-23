import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  search(@Query() query: Record<string, string>) {
    const profileId = query.profile_id;
    return this.searchService.search(query, profileId);
  }

  @Get('matches/recommended')
  getRecommended(@Query('profile_id') profileId: string) {
    return this.searchService.getRecommended(profileId);
  }

  @Get('matches/top')
  getTopMatches(@Query('profile_id') profileId: string) {
    return this.searchService.getTopMatches(profileId);
  }
}
