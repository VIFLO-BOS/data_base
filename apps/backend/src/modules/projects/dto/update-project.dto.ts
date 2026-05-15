/**
 * UpdateProjectDto
 * TODO: Define validation rules and fields.
 */

import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['draft', 'active', 'paused', 'completed', 'archived'])
  status?: string;
}