import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationService } from './verification.service';
import { VerifyDocumentDto, VerifyContactDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import { ProfileManager } from '../../database/entities';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService,
    @InjectRepository(ProfileManager)
    private readonly profileManagerRepo: Repository<ProfileManager>,
  ) {}

  private async assertProfileAccess(
    userId: string,
    profileId: string,
  ): Promise<void> {
    const manager = await this.profileManagerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });
    if (!manager) {
      throw new ForbiddenException('You are not a manager of this profile');
    }
  }

  @Post('email')
  async verifyEmail(
    @Body() dto: VerifyContactDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.assertProfileAccess(userId, dto.profile_id);
    return this.verificationService.verifyEmail(dto);
  }

  @Post('phone')
  async verifyPhone(
    @Body() dto: VerifyContactDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.assertProfileAccess(userId, dto.profile_id);
    return this.verificationService.verifyPhone(dto);
  }

  @Post('document')
  async verifyDocument(
    @Body() dto: VerifyDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.assertProfileAccess(userId, dto.profile_id);
    return this.verificationService.verifyDocument(dto);
  }

  @Get('status')
  async getStatus(
    @Query('profile_id') profileId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.assertProfileAccess(userId, profileId);
    return this.verificationService.getStatus(profileId);
  }
}
