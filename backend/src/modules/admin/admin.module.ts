import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, AuditLog, Report } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, AuditLog, Report])],
})
export class AdminModule {}
