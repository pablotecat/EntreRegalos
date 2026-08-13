import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Visibility } from '@prisma/client';
import { ListsRepository } from './lists.repository';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListsService {
  constructor(private readonly listsRepository: ListsRepository) {}

  findAllByOwner(ownerId: string) {
    return this.listsRepository.findAllByOwner(ownerId);
  }

  findPublic(userId: string) {
    return this.listsRepository.findPublic(userId);
  }

  findByUser(userId: string) {
    return this.listsRepository.findByUser(userId);
  }

  async findById(id: string, userId: string) {
    const list = await this.listsRepository.findById(id);
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.visibility === Visibility.PRIVATE && list.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta lista');
    }
    return list;
  }

  create(dto: CreateListDto, ownerId: string) {
    return this.listsRepository.create({
      name: dto.name,
      visibility: dto.visibility ?? Visibility.PRIVATE,
      owner: { connect: { id: ownerId } },
    });
  }

  async update(id: string, dto: UpdateListDto, userId: string) {
    const list = await this.listsRepository.findById(id);
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.ownerId !== userId) throw new ForbiddenException('No puedes editar esta lista');
    return this.listsRepository.update(id, dto);
  }

  async delete(id: string, userId: string) {
    const list = await this.listsRepository.findById(id);
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.ownerId !== userId) throw new ForbiddenException('No puedes eliminar esta lista');
    return this.listsRepository.delete(id);
  }
}
