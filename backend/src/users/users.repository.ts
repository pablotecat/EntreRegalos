import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        username: { equals: username, mode: 'insensitive' },
      },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  }

  findAllActiveExcept(excludeUserId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        id: { not: excludeUserId },
        isActive: true,
        invitationTokenId: { not: null },
      },
      orderBy: { username: 'asc' },
    });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  createPasswordResetToken(
    userId: string,
    expiresAt: Date,
  ): Promise<{
    token: string;
  }> {
    return this.prisma.passwordResetToken.create({
      data: { userId, expiresAt },
      select: { token: true },
    });
  }

  findActivePasswordResetTokens() {
    return this.prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
