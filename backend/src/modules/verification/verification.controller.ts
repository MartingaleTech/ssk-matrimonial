import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerifyDocumentDto, VerifyContactDto } from './dto';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('email')
  verifyEmail(@Body() dto: VerifyContactDto) {
    return this.verificationService.verifyEmail(dto);
  }

  @Post('phone')
  verifyPhone(@Body() dto: VerifyContactDto) {
    return this.verificationService.verifyPhone(dto);
  }

  @Post('document')
  verifyDocument(@Body() dto: VerifyDocumentDto) {
    return this.verificationService.verifyDocument(dto);
  }

  @Get('status')
  getStatus(@Query('profile_id') profileId: string) {
    return this.verificationService.getStatus(profileId);
  }
}
