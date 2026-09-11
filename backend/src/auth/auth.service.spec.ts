import { describe, it, expect, vi, beforeEach, type Mock, type Mocked } from 'vitest';
import {
  ConflictException,
  GoneException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcrypt');

const mockUser: User = {
  id: 'user-1',
  username: 'pablo',
  passwordHash: 'hashed',
  role: 'USER',
  isActive: true,
  invitationTokenId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockInvitacion = {
  id: 'inv-1',
  token: 'token-valido',
  used: false,
  expiresAt: new Date(Date.now() + 86400000),
  reference: null,
  createdAt: new Date(),
  createdById: 'admin-1',
};

const mockRefreshToken = {
  id: 'rt-1',
  token: 'refresh-token-valido',
  revoked: false,
  expiresAt: new Date(Date.now() + 86400000),
  userId: 'user-1',
  user: mockUser,
  createdAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Mocked<Pick<UsersService, 'findByUsername' | 'create'>>;
  let jwtService: Mocked<Pick<JwtService, 'sign'>>;
  let prisma: {
    refreshToken: {
      [K in 'create' | 'findUnique' | 'updateMany']: Mock<
        Parameters<PrismaService['refreshToken'][K]>,
        ReturnType<PrismaService['refreshToken'][K]>
      >;
    };
    invitation: {
      [K in 'findUnique' | 'update']: Mock<
        Parameters<PrismaService['invitation'][K]>,
        ReturnType<PrismaService['invitation'][K]>
      >;
    };
  };

  beforeEach(() => {
    vi.resetAllMocks();
    usersService = {
      findByUsername: vi.fn(),
      create: vi.fn(),
    };
    jwtService = { sign: vi.fn().mockReturnValue('access-token') };
    prisma = {
      refreshToken: {
        create: vi.fn().mockResolvedValue(mockRefreshToken),
        findUnique: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      invitation: {
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({ ...mockInvitacion, used: true }),
      },
    };

    const configService: Mocked<Pick<ConfigService, 'getOrThrow' | 'get'>> = {
      getOrThrow: vi.fn().mockReturnValue('test-secret'),
      get: vi.fn().mockReturnValue('15m'),
    };

    // esbuild does not emit the constructor metadata needed by Nest's test harness.
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      prisma as unknown as PrismaService,
    );
  });

  describe('login', () => {
    it('devuelve tokens cuando las credenciales son correctas', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ username: 'pablo', password: '12345678' });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        ),
      });
      expect(usersService.findByUsername).toHaveBeenCalledWith('pablo');
      expect(bcrypt.compare).toHaveBeenCalledWith('12345678', mockUser.passwordHash);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, username: mockUser.username, role: mockUser.role },
        { secret: 'test-secret', expiresIn: '15m' },
      );
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: { token: result.refreshToken, userId: mockUser.id, expiresAt: expect.any(Date) },
      });
    });

    it('lanza UnauthorizedException con contraseña incorrecta', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login({ username: 'pablo', password: 'incorrecta' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException si el usuario está desactivado', async () => {
      usersService.findByUsername.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login({ username: 'pablo', password: '12345678' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(service.login({ username: 'noexiste', password: '12345678' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('devuelve nuevo accessToken con refresh token válido', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);

      const result = await service.refresh('refresh-token-valido');
      expect(result).toEqual({ accessToken: 'access-token' });
      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'refresh-token-valido' },
        include: { user: true },
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, username: mockUser.username, role: mockUser.role },
        { secret: 'test-secret', expiresIn: '15m' },
      );
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si el token está revocado', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({ ...mockRefreshToken, revoked: true });

      await expect(service.refresh('token-revocado')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el token ha expirado', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh('token-expirado')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el token no existe', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('token-inexistente')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('revoca el refresh token correctamente', async () => {
      await service.logout('refresh-token');
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
        data: { revoked: true },
      });
    });
  });

  describe('register', () => {
    it('crea usuario y devuelve tokens con invitación válida', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockInvitacion);
      usersService.findByUsername.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        invitationToken: 'token-valido',
        username: 'nuevo',
        password: '12345678',
      });

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: expect.any(String) });
      expect(bcrypt.hash).toHaveBeenCalledWith('12345678', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        username: 'nuevo',
        passwordHash: 'hashed',
        invitationToken: { connect: { id: mockInvitacion.id } },
      });
      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { id: mockInvitacion.id },
        data: { used: true },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: { token: result.refreshToken, userId: mockUser.id, expiresAt: expect.any(Date) },
      });
    });

    it('lanza GoneException si la invitación está usada', async () => {
      prisma.invitation.findUnique.mockResolvedValue({ ...mockInvitacion, used: true });

      await expect(
        service.register({ invitationToken: 'token', username: 'nuevo', password: '12345678' }),
      ).rejects.toThrow(GoneException);
    });

    it('lanza GoneException si la invitación ha expirado', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        ...mockInvitacion,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.register({ invitationToken: 'token', username: 'nuevo', password: '12345678' }),
      ).rejects.toThrow(GoneException);
    });

    it('lanza NotFoundException si la invitación no existe', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      await expect(
        service.register({
          invitationToken: 'inexistente',
          username: 'nuevo',
          password: '12345678',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el username ya está en uso', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockInvitacion);
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(
        service.register({
          invitationToken: 'token-valido',
          username: 'pablo',
          password: '12345678',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
