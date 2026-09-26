import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { OtpCode, User, UserSession } from '../../database/entities';
import { AuthService } from './auth.service';
import { TwilioService } from './twilio.service';

describe('AuthService', () => {
  let userRepo: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let sessionRepo: { create: jest.Mock; save: jest.Mock; delete: jest.Mock };
  let otpRepo: {
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let jwt: { sign: jest.Mock };
  let twilio: { startVerification: jest.Mock; checkVerification: jest.Mock };
  let service: AuthService;

  const passwordHash = bcrypt.hashSync('correct-horse', 4);
  const activeUser = () => ({
    id: 'u1',
    email: 'a@b.c',
    phone: null,
    password_hash: passwordHash,
    is_active: true,
  });

  beforeEach(() => {
    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(async (u) => u),
      create: jest.fn((u) => ({ id: 'new', ...u })),
    };
    sessionRepo = {
      create: jest.fn((s) => ({ id: 'sess-1', ...s })),
      save: jest.fn(async (s) => s),
      delete: jest.fn(),
    };
    const qb = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };
    otpRepo = {
      create: jest.fn((o) => o),
      save: jest.fn(async (o) => o),
      createQueryBuilder: jest.fn(() => qb),
    };
    jwt = { sign: jest.fn(() => 'signed.jwt') };
    twilio = {
      startVerification: jest.fn().mockResolvedValue({ status: 'pending' }),
      checkVerification: jest.fn(),
    };
    service = new AuthService(
      userRepo as unknown as Repository<User>,
      sessionRepo as unknown as Repository<UserSession>,
      otpRepo as unknown as Repository<OtpCode>,
      jwt as unknown as JwtService,
      twilio as unknown as TwilioService,
    );
  });

  describe('login', () => {
    it('persists a session and embeds its id in the JWT', async () => {
      userRepo.findOne.mockResolvedValue(activeUser());

      const result = await service.login(
        { email: 'a@b.c', password: 'correct-horse' },
        { ipAddress: '127.0.0.1' },
      );

      expect(sessionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'u1', ip_address: '127.0.0.1' }),
      );
      const saved = sessionRepo.save.mock.calls[0][0];
      expect(saved.expires_at.getTime()).toBeGreaterThan(Date.now());
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'u1',
        sid: 'sess-1',
        email: 'a@b.c',
        phone: null,
      });
      expect(result).toMatchObject({
        token: 'signed.jwt',
        session_id: 'sess-1',
      });
    });

    it('rejects a wrong password without creating a session', async () => {
      userRepo.findOne.mockResolvedValue(activeUser());

      await expect(
        service.login({ email: 'a@b.c', password: 'nope' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(sessionRepo.save).not.toHaveBeenCalled();
    });

    it('rejects deactivated accounts even with the right password', async () => {
      userRepo.findOne.mockResolvedValue({ ...activeUser(), is_active: false });

      await expect(
        service.login({ email: 'a@b.c', password: 'correct-horse' }),
      ).rejects.toThrow('Account is deactivated');
    });
  });

  describe('logout', () => {
    it('revokes only the calling session by default', async () => {
      await service.logout('u1', 'sess-1');
      expect(sessionRepo.delete).toHaveBeenCalledWith({
        id: 'sess-1',
        user_id: 'u1',
      });
    });

    it('revokes every session for the user when all=true', async () => {
      await service.logout('u1', 'sess-1', true);
      expect(sessionRepo.delete).toHaveBeenCalledWith({ user_id: 'u1' });
    });
  });

  describe('forgotPassword', () => {
    const neutral = {
      message: 'If an account exists, a reset code has been sent',
    };

    it('returns the same response for unknown accounts without sending anything', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.forgotPassword({ email: 'ghost@b.c' }),
      ).resolves.toEqual(neutral);
      expect(twilio.startVerification).not.toHaveBeenCalled();
    });

    it('returns the same response for deactivated accounts', async () => {
      userRepo.findOne.mockResolvedValue({ ...activeUser(), is_active: false });

      await expect(service.forgotPassword({ email: 'a@b.c' })).resolves.toEqual(
        neutral,
      );
      expect(twilio.startVerification).not.toHaveBeenCalled();
    });

    it('starts a Twilio verification for active accounts', async () => {
      userRepo.findOne.mockResolvedValue(activeUser());

      await expect(service.forgotPassword({ email: 'a@b.c' })).resolves.toEqual(
        neutral,
      );
      expect(twilio.startVerification).toHaveBeenCalledWith('a@b.c', 'email');
    });
  });

  describe('resetPassword', () => {
    const dto = {
      email: 'a@b.c',
      code: '123456',
      new_password: 'n3w-passw0rd',
    };

    it('rejects an invalid code and leaves the password and sessions intact', async () => {
      userRepo.findOne.mockResolvedValue(activeUser());
      twilio.checkVerification.mockResolvedValue(false);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepo.save).not.toHaveBeenCalled();
      expect(sessionRepo.delete).not.toHaveBeenCalled();
    });

    it('replaces the hash, revokes all sessions and issues a fresh one on success', async () => {
      const user = activeUser();
      userRepo.findOne.mockResolvedValue(user);
      twilio.checkVerification.mockResolvedValue(true);

      const result = await service.resetPassword(dto);

      expect(twilio.checkVerification).toHaveBeenCalledWith('a@b.c', '123456');
      const savedUser = userRepo.save.mock.calls[0][0];
      expect(savedUser.password_hash).not.toBe(passwordHash);
      expect(bcrypt.compareSync('n3w-passw0rd', savedUser.password_hash)).toBe(
        true,
      );
      expect(sessionRepo.delete).toHaveBeenCalledWith({ user_id: 'u1' });
      expect(sessionRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        token: 'signed.jwt',
        session_id: 'sess-1',
      });
    });

    it('does not reveal whether the account exists', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        'Invalid or expired OTP',
      );
      expect(twilio.checkVerification).not.toHaveBeenCalled();
    });
  });
});
