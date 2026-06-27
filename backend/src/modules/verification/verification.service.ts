import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification, Profile } from '../../database/entities';
import { VerifyDocumentDto, VerifyContactDto } from './dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private verificationRepo: Repository<Verification>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
  ) {}

  async verifyEmail(dto: VerifyContactDto) {
    const verification = this.verificationRepo.create({
      profile_id: dto.profile_id,
      type: 'email',
      status: 'verified',
      requested_at: new Date(),
      verified_at: new Date(),
      metadata: { email: dto.email },
    });
    await this.verificationRepo.save(verification);

    await this.profileRepo.update(dto.profile_id, { email_verified: true });

    return verification;
  }

  async verifyPhone(dto: VerifyContactDto) {
    const verification = this.verificationRepo.create({
      profile_id: dto.profile_id,
      type: 'phone',
      status: 'verified',
      requested_at: new Date(),
      verified_at: new Date(),
      metadata: { phone: dto.phone },
    });
    await this.verificationRepo.save(verification);

    await this.profileRepo.update(dto.profile_id, { phone_verified: true });

    return verification;
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
}
