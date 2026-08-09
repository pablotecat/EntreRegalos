import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ItemsRepository } from './items.repository';
import { ListsRepository } from '../lists/lists.repository';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    private readonly itemsRepository: ItemsRepository,
    private readonly listsRepository: ListsRepository,
  ) {}

  private async verificarPropietario(listId: string, userId: string) {
    const list = await this.listsRepository.findById(listId);
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.ownerId !== userId) throw new ForbiddenException('No puedes modificar esta lista');
    return list;
  }

  async create(listId: string, dto: CreateItemDto, userId: string) {
    await this.verificarPropietario(listId, userId);
    return this.itemsRepository.create({
      name: dto.name,
      description: dto.description,
      list: { connect: { id: listId } },
    });
  }

  async update(listId: string, itemId: string, dto: UpdateItemDto, userId: string) {
    await this.verificarPropietario(listId, userId);
    const item = await this.itemsRepository.findById(itemId);
    if (!item || item.listId !== listId) throw new NotFoundException('Artículo no encontrado');
    return this.itemsRepository.update(itemId, dto);
  }

  async delete(listId: string, itemId: string, userId: string) {
    await this.verificarPropietario(listId, userId);
    const item = await this.itemsRepository.findById(itemId);
    if (!item || item.listId !== listId) throw new NotFoundException('Artículo no encontrado');
    return this.itemsRepository.delete(itemId);
  }
}
