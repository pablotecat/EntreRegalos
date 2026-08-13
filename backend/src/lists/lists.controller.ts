import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findMine(@CurrentUser() user: User) {
    return this.listsService.findAllByOwner(user.id);
  }

  @Get('public')
  findPublic(@CurrentUser() user: User) {
    return this.listsService.findPublic(user.id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.listsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.findById(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateListDto, @CurrentUser() user: User) {
    return this.listsService.create(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListDto, @CurrentUser() user: User) {
    return this.listsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.delete(id, user.id);
  }
}
