/**
 * ExportRequestDto
 * TODO: Define validation rules and fields.
 */

import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExportRequestDto {
  @ApiProperty({ enum: ['csv', 'json'] })
  @IsString()
  @IsIn(['csv', 'json'])
  type: string;

  @ApiProperty({ enum: ['timesheets', 'projects', 'taskers', 'users'] })
  @IsString()
  resource: string;

  @ApiPropertyOptional({ description: 'Optional JSON filters' })
  @IsOptional()
  filters?: Record<string, any>;
}