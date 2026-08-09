import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsRepository } from './lists.repository';
import { ListsService } from './lists.service';

@Module({
  controllers: [ListsController],
  providers: [ListsService, ListsRepository],
})
export class ListsModule {}
