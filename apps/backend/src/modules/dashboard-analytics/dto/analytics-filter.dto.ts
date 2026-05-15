/**
 * AnalyticsFilterDto
 */
import { IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsFilterDto {
  @ApiPropertyOptional({ enum: ['day', 'week', 'month', 'year', 'custom'] })
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year', 'custom'])
  range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
