/**
 * Projects Module
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectEntity } from './entities/project.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { AccountEntity } from '../accounts/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, TaskerEntity, AccountEntity])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
