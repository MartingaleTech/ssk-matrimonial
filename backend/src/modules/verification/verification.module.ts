import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { Verification, Profile, ProfileManager } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Verification, Profile, ProfileManager])],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
