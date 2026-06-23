import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { KundaliService } from './kundali.service';
import {
  GenerateKundaliDto,
  MatchKundaliDto,
  UploadKundaliDto,
  AiInterpretDto,
  UpdateKundaliPreferencesDto,
} from './dto';
import { CurrentUser } from '../../common/decorators';

@Controller()
export class KundaliController {
  constructor(private readonly kundaliService: KundaliService) {}

  @Post('kundali/generate')
  generate(@Body() dto: GenerateKundaliDto, @CurrentUser('id') userId: string) {
    return this.kundaliService.generate(dto, userId);
  }

  @Get('kundali/:profileId')
  getKundali(@Param('profileId') profileId: string) {
    return this.kundaliService.getKundali(profileId);
  }

  @Post('kundali/match')
  match(@Body() dto: MatchKundaliDto) {
    return this.kundaliService.match(dto);
  }

  @Get('kundali/match/:profileId')
  getMatchResults(@Param('profileId') profileId: string) {
    return this.kundaliService.getMatchResults(profileId);
  }

  @Get('kundali/summary/:profileId')
  getSummary(@Param('profileId') profileId: string) {
    return this.kundaliService.getSummary(profileId);
  }

  @Post('kundali/ai-interpret')
  aiInterpret(@Body() dto: AiInterpretDto) {
    return this.kundaliService.aiInterpret(dto);
  }

  @Patch('profiles/:id/kundali/preferences')
  updatePreferences(
    @Param('id') profileId: string,
    @Body() dto: UpdateKundaliPreferencesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.kundaliService.updatePreferences(profileId, dto, userId);
  }

  @Get('search/kundali')
  searchByKundali(@Query() query: Record<string, string>) {
    return this.kundaliService.searchByKundali(query);
  }

  @Post('kundali/upload')
  upload(@Body() dto: UploadKundaliDto, @CurrentUser('id') userId: string) {
    return this.kundaliService.upload(dto, userId);
  }

  @Delete('kundali/:profileId')
  deleteKundali(
    @Param('profileId') profileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.kundaliService.deleteKundali(profileId, userId);
  }
}
