import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User, UserSession } from '../../database/entities';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy.validate', () => {
  let userRepo: { findOne: jest.Mock };
  let sessionRepo: { findOne: jest.Mock };
  let strategy: JwtStrategy;

  const payload = { sub: 'u1', sid: 's1', email: 'a@b.c', phone: null };
  const liveSession = () => ({
    id: 's1',
    user_id: 'u1',
    expires_at: new Date(Date.now() + 60_000),
  });

  beforeEach(() => {
    userRepo = { findOne: jest.fn() };
    sessionRepo = { findOne: jest.fn() };
    strategy = new JwtStrategy(
      { getOrThrow: () => 'test-secret' } as unknown as ConfigService,
      userRepo as unknown as Repository<User>,
      sessionRepo as unknown as Repository<UserSession>,
    );
  });

  it('rejects tokens issued before sessions existed (no sid claim)', async () => {
    await expect(strategy.validate({ sub: 'u1' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(sessionRepo.findOne).not.toHaveBeenCalled();
  });

  it('rejects a token whose session has been revoked', async () => {
    sessionRepo.findOne.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(sessionRepo.findOne).toHaveBeenCalledWith({
      where: { id: 's1', user_id: 'u1' },
    });
    expect(userRepo.findOne).not.toHaveBeenCalled();
  });

  it('rejects an expired session even if the JWT is still valid', async () => {
    sessionRepo.findOne.mockResolvedValue({
      ...liveSession(),
      expires_at: new Date(Date.now() - 1),
    });

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects deactivated users', async () => {
    sessionRepo.findOne.mockResolvedValue(liveSession());
    userRepo.findOne.mockResolvedValue({ id: 'u1', is_active: false });

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns the principal with the session id for a live session', async () => {
    sessionRepo.findOne.mockResolvedValue(liveSession());
    userRepo.findOne.mockResolvedValue({
      id: 'u1',
      email: 'a@b.c',
      phone: null,
      is_active: true,
    });

    await expect(strategy.validate(payload)).resolves.toEqual({
      id: 'u1',
      email: 'a@b.c',
      phone: null,
      session_id: 's1',
    });
  });
});
