/**
 * NotificationFilterDto
 * TODO: Define validation rules and fields.
 */

import { IsOptional, IsIn, IsBooleanString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationFilterDto {
  @ApiPropertyOptional({ enum: ['true', 'false'] })
  @IsOptional()
  @IsBooleanString()
  isRead?: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'success', 'error'] })
  @IsOptional()
  @IsIn(['info', 'warning', 'success', 'error'])
  type?: string;
}
