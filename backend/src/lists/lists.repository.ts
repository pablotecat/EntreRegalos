import { Injectable } from '@nestjs/common';
import { List, Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByOwner(ownerId: string) {
    return this.prisma.list.findMany({
      where: { ownerId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublic(excludeOwnerId: string) {
    return this.prisma.list.findMany({
      where: { visibility: Visibility.PUBLIC, ownerId: { not: excludeOwnerId } },
      include: {
        owner: { select: { id: true, username: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.list.findUnique({
      where: { id },
      include: {
        items: { orderBy: { order: 'asc' } },
        owner: { select: { id: true, username: true } },
      },
    });
  }

  create(data: Prisma.ListCreateInput): Promise<List> {
    return this.prisma.list.create({ data });
  }

  update(id: string, data: Prisma.ListUpdateInput): Promise<List> {
    return this.prisma.list.update({ where: { id }, data });
  }

  delete(id: string): Promise<List> {
    return this.prisma.list.delete({ where: { id } });
  }
}
