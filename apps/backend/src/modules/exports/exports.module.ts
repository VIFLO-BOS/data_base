/**
 * Exports Module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { ExportJobEntity } from './entities/export-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExportJobEntity])],
  controllers: [ExportsController],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}