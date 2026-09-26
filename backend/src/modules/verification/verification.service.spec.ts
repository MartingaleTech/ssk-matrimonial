import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Profile, User, Verification } from '../../database/entities';
import { TwilioService } from '../auth/twilio.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { VerificationService } from './verification.service';

describe('VerificationService', () => {
  let verificationRepo: { create: jest.Mock; save: jest.Mock };
  let profileRepo: { update: jest.Mock; findOne: jest.Mock };
  let userRepo: { findOne: jest.Mock };
  let subscriptions: { grantFreeTrialIfEligible: jest.Mock };
  let twilio: { startVerification: jest.Mock; checkVerification: jest.Mock };
  let service: VerificationService;

  const user = { id: 'u1', email: 'owner@example.com', phone: '+15550001' };
  const dto = { profile_id: 'p1', code: '123456' };

  beforeEach(() => {
    verificationRepo = {
      create: jest.fn((v) => v),
      save: jest.fn(async (v) => ({ id: 'v1', ...v })),
    };
    profileRepo = { update: jest.fn(), findOne: jest.fn() };
    userRepo = { findOne: jest.fn().mockResolvedValue(user) };
    subscriptions = { grantFreeTrialIfEligible: jest.fn() };
    twilio = {
      startVerification: jest.fn().mockResolvedValue({ status: 'pending' }),
      checkVerification: jest.fn(),
    };
    service = new VerificationService(
      verificationRepo as unknown as Repository<Verification>,
      profileRepo as unknown as Repository<Profile>,
      userRepo as unknown as Repository<User>,
      subscriptions as unknown as SubscriptionsService,
      twilio as unknown as TwilioService,
    );
  });

  describe('requestContactOtp', () => {
    it('sends the OTP to the contact stored on the account, never a caller-supplied one', async () => {
      await service.requestContactOtp('u1', {
        profile_id: 'p1',
        channel: 'phone',
      });
      expect(twilio.startVerification).toHaveBeenCalledWith('+15550001', 'sms');

      await service.requestContactOtp('u1', {
        profile_id: 'p1',
        channel: 'email',
      });
      expect(twilio.startVerification).toHaveBeenCalledWith(
        'owner@example.com',
        'email',
      );
    });

    it('fails when the account has no such contact', async () => {
      userRepo.findOne.mockResolvedValue({ ...user, phone: null });
      await expect(
        service.requestContactOtp('u1', { profile_id: 'p1', channel: 'phone' }),
      ).rejects.toThrow(BadRequestException);
      expect(twilio.startVerification).not.toHaveBeenCalled();
    });

    it('fails for an unknown user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.requestContactOtp('u1', { profile_id: 'p1', channel: 'email' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyEmail / verifyPhone', () => {
    it('does not mark anything verified when Twilio rejects the code', async () => {
      twilio.checkVerification.mockResolvedValue(false);

      await expect(service.verifyEmail('u1', dto)).rejects.toThrow(
        'Invalid or expired OTP',
      );
      expect(twilio.checkVerification).toHaveBeenCalledWith(
        'owner@example.com',
        '123456',
      );
      expect(verificationRepo.save).not.toHaveBeenCalled();
      expect(profileRepo.update).not.toHaveBeenCalled();
      expect(subscriptions.grantFreeTrialIfEligible).not.toHaveBeenCalled();
    });

    it('marks the email verified and records an audit row on approval', async () => {
      twilio.checkVerification.mockResolvedValue(true);
      profileRepo.findOne.mockResolvedValue({
        email_verified: true,
        phone_verified: false,
      });

      const result = await service.verifyEmail('u1', dto);

      expect(result).toMatchObject({
        profile_id: 'p1',
        type: 'email',
        status: 'verified',
        metadata: { email: 'owner@example.com', verified_by_user_id: 'u1' },
      });
      expect(profileRepo.update).toHaveBeenCalledWith('p1', {
        email_verified: true,
      });
      expect(subscriptions.grantFreeTrialIfEligible).not.toHaveBeenCalled();
    });

    it('checks the phone code against the account phone', async () => {
      twilio.checkVerification.mockResolvedValue(true);
      profileRepo.findOne.mockResolvedValue({
        email_verified: false,
        phone_verified: true,
      });

      await service.verifyPhone('u1', dto);

      expect(twilio.checkVerification).toHaveBeenCalledWith(
        '+15550001',
        '123456',
      );
      expect(profileRepo.update).toHaveBeenCalledWith('p1', {
        phone_verified: true,
      });
    });

    it('grants the free trial only once both contacts are verified', async () => {
      twilio.checkVerification.mockResolvedValue(true);
      profileRepo.findOne.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
      });

      await service.verifyPhone('u1', dto);

      expect(subscriptions.grantFreeTrialIfEligible).toHaveBeenCalledWith('p1');
    });
  });
});
