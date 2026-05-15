/**
 * GenerateReportDto
 * TODO: Define validation rules and fields.
 */

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({ example: 'Monthly Timesheet Summary' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['timesheets', 'projects', 'taskers', 'users'] })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Optional JSON filters' })
  @IsOptional()
  filters?: Record<string, any>;
}