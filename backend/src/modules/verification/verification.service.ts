import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification } from '../../database/entities';
import { VerifyDocumentDto, VerifyContactDto } from './dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private verificationRepo: Repository<Verification>,
  ) {}

  async verifyEmail(dto: VerifyContactDto) {
    const verification = this.verificationRepo.create({
      profile_id: dto.profile_id,
      type: 'email',
      status: 'pending',
      requested_at: new Date(),
      metadata: { email: dto.email },
    });
    return this.verificationRepo.save(verification);
  }

  async verifyPhone(dto: VerifyContactDto) {
    const verification = this.verificationRepo.create({
      profile_id: dto.profile_id,
      type: 'phone',
      status: 'pending',
      requested_at: new Date(),
      metadata: { phone: dto.phone },
    });
    return this.verificationRepo.save(verification);
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
    return { profile_id: profileId, verifications };
  }
}
