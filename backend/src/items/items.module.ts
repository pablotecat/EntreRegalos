import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsRepository } from './items.repository';
import { ItemsService } from './items.service';
import { ListsRepository } from '../lists/lists.repository';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, ItemsRepository, ListsRepository],
})
export class ItemsModule {}
