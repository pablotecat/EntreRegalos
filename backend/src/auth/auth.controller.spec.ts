import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController cookies', () => {
  const tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
  const service = {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  };
  const response = { cookie: vi.fn(), clearCookie: vi.fn() };
  const res = response as unknown as Response;
  const controller = new AuthController(service as unknown as AuthService);

  beforeEach(() => {
    vi.resetAllMocks();
    service.login.mockResolvedValue(tokens);
    service.register.mockResolvedValue(tokens);
    service.logout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ['login', 'production'],
    ['register', 'production'],
    ['login', 'development'],
    ['register', 'development'],
  ] as const)('%s emits the shared-path cookie in %s', async (method, environment) => {
    vi.stubEnv('NODE_ENV', environment);
    const dto = { username: 'user', password: 'password', invitationToken: 'invitation' };

    await expect(controller[method](dto, res)).resolves.toEqual({
      accessToken: tokens.accessToken,
    });

    expect(service[method]).toHaveBeenCalledWith(dto);
    expect(response.clearCookie).toHaveBeenCalledTimes(1);
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', {
      path: '/api/v1/auth/refresh',
    });
    expect(response.cookie).toHaveBeenCalledTimes(1);
    expect(response.cookie).toHaveBeenCalledWith('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: environment === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  it('passes the cookie token to refresh', async () => {
    service.refresh.mockResolvedValue({ accessToken: 'renewed-access-token' });
    const req = { cookies: { refreshToken: tokens.refreshToken } } as unknown as Request;

    await expect(controller.refresh(req)).resolves.toEqual({ accessToken: 'renewed-access-token' });
    expect(service.refresh).toHaveBeenCalledTimes(1);
    expect(service.refresh).toHaveBeenCalledWith(tokens.refreshToken);
  });

  it('rejects refresh without a cookie', async () => {
    await expect(controller.refresh({} as Request)).rejects.toThrow(UnauthorizedException);
    expect(service.refresh).not.toHaveBeenCalled();
  });

  it.each([tokens.refreshToken, undefined])(
    'logout revokes the received token (%s) and clears both cookie paths',
    async (refreshToken) => {
      const req = { cookies: { refreshToken } } as unknown as Request;
      const prisma = { refreshToken: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) } };
      service.logout.mockImplementation((token: string) =>
        AuthService.prototype.logout.call({ prisma } as unknown as AuthService, token),
      );

      await controller.logout(req, res);

      if (refreshToken) {
        expect(service.logout).toHaveBeenCalledTimes(1);
        expect(service.logout).toHaveBeenCalledWith(refreshToken);
        expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
          where: { token: refreshToken },
          data: { revoked: true },
        });
      } else {
        expect(service.logout).not.toHaveBeenCalled();
        expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
      }
      expect(response.clearCookie.mock.calls).toEqual([
        ['refreshToken', { path: '/api/v1/auth' }],
        ['refreshToken', { path: '/api/v1/auth/refresh' }],
      ]);
      expect(response.cookie).not.toHaveBeenCalled();
    },
  );
});
