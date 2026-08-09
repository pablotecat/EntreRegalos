import {
  Body, Controller, Delete, HttpCode, HttpStatus,
  Param, Patch, Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

@Controller('lists/:listId/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('listId') listId: string,
    @Body() dto: CreateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.create(listId, dto, user.id);
  }

  @Patch(':itemId')
  update(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.update(listId, itemId, dto, user.id);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.delete(listId, itemId, user.id);
  }
}
