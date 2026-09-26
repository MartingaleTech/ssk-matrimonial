import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification, Profile, User } from '../../database/entities';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { TwilioService } from '../auth/twilio.service';
import {
  VerifyDocumentDto,
  VerifyContactDto,
  RequestContactOtpDto,
} from './dto';

type ContactChannel = 'email' | 'phone';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private verificationRepo: Repository<Verification>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly twilioService: TwilioService,
  ) {}

  /**
   * Sends an OTP to the address stored on the authenticated user's account.
   * The destination is never taken from the request, so a caller can only
   * ever prove ownership of their own registered email/phone.
   */
  async requestContactOtp(userId: string, dto: RequestContactOtpDto) {
    const to = await this.getUserContact(userId, dto.channel);
    const result = await this.twilioService.startVerification(
      to,
      dto.channel === 'email' ? 'email' : 'sms',
    );
    return { message: 'OTP sent successfully', status: result.status };
  }

  verifyEmail(userId: string, dto: VerifyContactDto) {
    return this.verifyContact(userId, 'email', dto);
  }

  verifyPhone(userId: string, dto: VerifyContactDto) {
    return this.verifyContact(userId, 'phone', dto);
  }

  private async verifyContact(
    userId: string,
    channel: ContactChannel,
    dto: VerifyContactDto,
  ) {
    const to = await this.getUserContact(userId, channel);

    const approved = await this.twilioService.checkVerification(to, dto.code);
    if (!approved) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const now = new Date();
    const verification = this.verificationRepo.create({
      profile_id: dto.profile_id,
      type: channel,
      status: 'verified',
      requested_at: now,
      verified_at: now,
      metadata: { [channel]: to, verified_by_user_id: userId },
    });
    await this.verificationRepo.save(verification);

    await this.profileRepo.update(
      dto.profile_id,
      channel === 'email' ? { email_verified: true } : { phone_verified: true },
    );
    await this.grantTrialIfFullyVerified(dto.profile_id);

    return verification;
  }

  private async getUserContact(
    userId: string,
    channel: ContactChannel,
  ): Promise<string> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const to = channel === 'email' ? user.email : user.phone;
    if (!to) {
      throw new BadRequestException(
        `No ${channel} is registered on this account`,
      );
    }
    return to;
  }

  async verifyDocument(dto: VerifyDocumentDto) {
    const verification = this.verificationRepo.create({
      profile_id: dto.profile_id,
      type: 'document',
      status: 'pending',
      requested_at: new Date(),
      metadata: {
        document_url: dto.document_url,
        document_type: dto.document_type,
        ...dto.metadata,
      },
    });
    return this.verificationRepo.save(verification);
  }

  async getStatus(profileId: string) {
    const verifications = await this.verificationRepo.find({
      where: { profile_id: profileId },
      order: { requested_at: 'DESC' },
    });

    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });

    return {
      profile_id: profileId,
      email_verified: profile?.email_verified ?? false,
      phone_verified: profile?.phone_verified ?? false,
      verifications,
    };
  }

  /**
   * A profile counts as verified once both contact channels are confirmed,
   * which is what makes it eligible for the promotional free trial.
   */
  private async grantTrialIfFullyVerified(profileId: string): Promise<void> {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });
    if (profile?.email_verified && profile?.phone_verified) {
      await this.subscriptionsService.grantFreeTrialIfEligible(profileId);
    }
  }
}
