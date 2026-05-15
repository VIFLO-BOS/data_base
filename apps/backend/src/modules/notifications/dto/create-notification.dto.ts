/**
 * CreateNotificationDto
 * TODO: Define validation rules and fields.
 */

import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to notify' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'New project assigned' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'You have been assigned to Project Alpha.' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'success', 'error'] })
  @IsOptional()
  @IsIn(['info', 'warning', 'success', 'error'])
  type?: string;

  @ApiPropertyOptional({ example: '/projects/abc-123' })
  @IsString()
  @IsOptional()
  link?: string;
}