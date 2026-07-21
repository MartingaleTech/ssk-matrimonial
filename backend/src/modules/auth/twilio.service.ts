import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

export type VerificationChannel = 'sms' | 'email';

@Injectable()
export class TwilioService implements OnModuleInit {
  private readonly logger = new Logger(TwilioService.name);
  private client: Twilio | null = null;
  private verifyServiceSid: string | undefined;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    this.verifyServiceSid = this.configService.get<string>(
      'twilio.verifyServiceSid',
    );

    if (!accountSid || !authToken || !this.verifyServiceSid) {
      this.logger.warn(
        'Twilio is not fully configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_VERIFY_SERVICE_SID to enable OTP delivery.',
      );
      return;
    }

    this.client = new Twilio(accountSid, authToken);
  }

  private getClient(): Twilio {
    if (!this.client || !this.verifyServiceSid) {
      throw new InternalServerErrorException(
        'Twilio Verify is not configured on the server',
      );
    }
    return this.client;
  }

  async startVerification(to: string, channel: VerificationChannel) {
    const verification = await this.getClient()
      .verify.v2.services(this.verifyServiceSid!)
      .verifications.create({ to, channel });

    return { sid: verification.sid, status: verification.status };
  }

  async checkVerification(to: string, code: string): Promise<boolean> {
    const check = await this.getClient()
      .verify.v2.services(this.verifyServiceSid!)
      .verificationChecks.create({ to, code });

    return check.status === 'approved';
  }
}
