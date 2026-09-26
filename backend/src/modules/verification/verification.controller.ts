import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationService } from './verification.service';
import { Throttle } from '@nestjs/throttler';
import {
  VerifyDocumentDto,
  VerifyContactDto,
  RequestContactOtpDto,
} from './dto';
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
    if (!userId || !profileId) {
      throw new BadRequestException('User ID and profile ID are required');
    }
    const manager = await this.profileManagerRepo.findOne({
      where: { user_id: userId, profile_id: profileId },
    });
    if (!manager) {
      throw new ForbiddenException('You are not a manager of this profile');
    }
  }

  @Post('send-otp')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async sendOtp(
    @Body() dto: RequestContactOtpDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.assertProfileAccess(userId, dto.profile_id);
    return this.verificationService.requestContactOtp(userId, dto);
  }

  @Post('email')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyEmail(
    @Body() dto: VerifyContactDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.assertProfileAccess(userId, dto.profile_id);
    return this.verificationService.verifyEmail(userId, dto);
  }

  @Post('phone')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyPhone(
    @Body() dto: VerifyContactDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.assertProfileAccess(userId, dto.profile_id);
    return this.verificationService.verifyPhone(userId, dto);
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
    if (!profileId) {
      throw new BadRequestException('profile_id query parameter is required');
    }
    await this.assertProfileAccess(userId, profileId);
    return this.verificationService.getStatus(profileId);
  }
}
