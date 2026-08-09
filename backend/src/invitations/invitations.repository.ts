import { Injectable } from '@nestjs/common';
import { Invitation, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.InvitationCreateInput): Promise<Invitation> {
    return this.prisma.invitation.create({ data });
  }

  findAll(): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findByToken(token: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({ where: { token } });
  }
}
