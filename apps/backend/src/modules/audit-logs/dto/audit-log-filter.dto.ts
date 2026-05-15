/**
 * AuditLogFilterDto
 * TODO: Define validation rules and fields.
 */

import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogFilterDto {
  @ApiPropertyOptional({ example: 'project.create' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'projects' })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}