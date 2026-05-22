/**
 * CreateProjectDto
 * TODO: Define validation rules and fields.
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project Alpha' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'A data annotation project' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Upwork' })
  @IsString()
  @IsOptional()
  platformName?: string;

  @ApiPropertyOptional({ example: 'https://upwork.com' })
  @IsString()
  @IsOptional()
  platformUrl?: string;

  @ApiPropertyOptional({ example: 15.5 })
  @IsNumber()
  @IsOptional()
  pricePerHour?: number;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'UUIDs of linked accounts',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accountIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  taskerIds?: string[];
}
