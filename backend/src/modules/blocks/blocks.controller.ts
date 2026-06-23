import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto';
import { CurrentUser } from '../../common/decorators';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(@Body() dto: CreateBlockDto, @CurrentUser('id') userId: string) {
    return this.blocksService.create(dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.blocksService.remove(id, userId);
  }
}
