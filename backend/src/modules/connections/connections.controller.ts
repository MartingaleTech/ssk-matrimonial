import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto';
import { CurrentUser } from '../../common/decorators';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post()
  create(@Body() dto: CreateConnectionDto, @CurrentUser('id') userId: string) {
    return this.connectionsService.create(dto, userId);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.connectionsService.accept(id, userId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.connectionsService.reject(id, userId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.connectionsService.cancel(id, userId);
  }

  @Patch(':id/resend')
  resend(
    @Param('id') id: string,
    @Body() body: { message?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.connectionsService.resend(id, userId, body.message);
  }

  @Get()
  findAll(
    @Query() query: Record<string, string>,
    @CurrentUser('id') userId: string,
  ) {
    return this.connectionsService.findAll(query, userId);
  }
}
