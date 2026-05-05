/**
 * Exports Module
 */
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
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
