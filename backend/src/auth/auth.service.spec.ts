import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, GoneException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcrypt');

const mockUser = {
  id: 'user-1',
  username: 'pablo',
  passwordHash: 'hashed',
  role: 'USER',
  isActive: true,
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
  let usersService: { findByUsername: ReturnType<typeof vi.fn>; findById: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  let jwtService: { sign: ReturnType<typeof vi.fn> };
  let prisma: {
    refreshToken: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
    invitation: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    usersService = {
      findByUsername: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };
    jwtService = { sign: vi.fn().mockReturnValue('access-token') };
    prisma = {
      refreshToken: {
        create: vi.fn().mockResolvedValue({ token: 'refresh-uuid' }),
        findUnique: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      invitation: {
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: vi.fn().mockReturnValue('test-secret'),
            get: vi.fn().mockReturnValue('15m'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('devuelve tokens cuando las credenciales son correctas', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.refreshToken.create.mockResolvedValue({ token: 'refresh-uuid' });

      const result = await service.login({ username: 'pablo', password: '12345678' });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('lanza UnauthorizedException con contraseña incorrecta', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login({ username: 'pablo', password: 'incorrecta' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el usuario está desactivado', async () => {
      usersService.findByUsername.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login({ username: 'pablo', password: '12345678' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(service.login({ username: 'noexiste', password: '12345678' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('devuelve nuevo accessToken con refresh token válido', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);

      const result = await service.refresh('refresh-token-valido');
      expect(result).toHaveProperty('accessToken');
    });

    it('lanza UnauthorizedException si el token está revocado', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({ ...mockRefreshToken, revoked: true });

      await expect(service.refresh('token-revocado'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el token ha expirado', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh('token-expirado'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el token no existe', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('token-inexistente'))
        .rejects.toThrow(UnauthorizedException);
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

      expect(result).toHaveProperty('accessToken');
      expect(prisma.invitation.update).toHaveBeenCalled();
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
        service.register({ invitationToken: 'inexistente', username: 'nuevo', password: '12345678' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el username ya está en uso', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockInvitacion);
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(
        service.register({ invitationToken: 'token-valido', username: 'pablo', password: '12345678' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
