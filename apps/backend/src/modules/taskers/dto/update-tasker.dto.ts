/**
 * UpdateTaskerDto
 * TODO: Define validation rules and fields.
 */

import { IsString, IsOptional, IsNumber, IsArray, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskerDto {
  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ enum: ['available', 'assigned', 'unavailable'] })
  @IsString()
  @IsOptional()
  @IsIn(['available', 'assigned', 'unavailable'])
  availabilityStatus?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;
}