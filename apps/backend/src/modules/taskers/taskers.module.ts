/**
 * Taskers Module
 */
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TaskersController } from './taskers.controller';
import { TaskersService } from './taskers.service';
import { TaskerEntity } from './entities/tasker.entity';


@Module({
  imports: [TypeOrmModule.forFeature([TaskerEntity])],
  controllers: [TaskersController],
  providers: [TaskersService],
  exports: [TaskersService],
})
export class TaskersModule {}
