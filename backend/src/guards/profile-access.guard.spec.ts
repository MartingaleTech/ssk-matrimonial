import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { ProfileManager } from '../database/entities';
import { ProfileAccessGuard } from './profile-access.guard';
import { RolesGuard } from './roles.guard';

type RequestLike = {
  user?: { id: string };
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  manager?: ProfileManager;
};

function contextFor(request: RequestLike): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('ProfileAccessGuard', () => {
  let repo: { findOne: jest.Mock };
  let guard: ProfileAccessGuard;

  beforeEach(() => {
    repo = { findOne: jest.fn() };
    guard = new ProfileAccessGuard(
      repo as unknown as Repository<ProfileManager>,
    );
  });

  it('denies unauthenticated requests before hitting the database', async () => {
    await expect(
      guard.canActivate(contextFor({ params: { id: 'p1' } })),
    ).rejects.toThrow(ForbiddenException);
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('denies when the route has no profile id param', async () => {
    await expect(
      guard.canActivate(contextFor({ user: { id: 'u1' }, params: {} })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('denies users who do not manage the profile', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'u1' }, params: { id: 'p1' } }),
      ),
    ).rejects.toThrow('You are not a manager of this profile');
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { user_id: 'u1', profile_id: 'p1' },
    });
  });

  it('allows managers and attaches the manager row to the request', async () => {
    const manager = { id: 'm1', role: 'parent' } as ProfileManager;
    repo.findOne.mockResolvedValue(manager);
    const request: RequestLike = { user: { id: 'u1' }, params: { id: 'p1' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.manager).toBe(manager);
  });
});

describe('RolesGuard', () => {
  let repo: { findOne: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    repo = { findOne: jest.fn() };
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(
      reflector as unknown as Reflector,
      repo as unknown as Repository<ProfileManager>,
    );
  });

  it('passes through when the handler declares no roles', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(guard.canActivate(contextFor({}))).resolves.toBe(true);
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('rejects a manager whose role is not in the required set', async () => {
    reflector.getAllAndOverride.mockReturnValue(['owner', 'parent']);
    repo.findOne.mockResolvedValue({ role: 'family' });

    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'u1' }, params: { id: 'p1' } }),
      ),
    ).rejects.toThrow('Insufficient role permissions');
  });

  it('rejects when the user manages no such profile', async () => {
    reflector.getAllAndOverride.mockReturnValue(['owner']);
    repo.findOne.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'u1' }, params: { id: 'p1' } }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('resolves the profile id from body.profile_id when absent from params', async () => {
    reflector.getAllAndOverride.mockReturnValue(['owner']);
    repo.findOne.mockResolvedValue({ role: 'owner' });

    await expect(
      guard.canActivate(
        contextFor({
          user: { id: 'u1' },
          params: {},
          body: { profile_id: 'p9' },
        }),
      ),
    ).resolves.toBe(true);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { user_id: 'u1', profile_id: 'p9' },
    });
  });
});
