/**
 * CreateTaskerDto
 * TODO: Define validation rules and fields.
 */

import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskerDto {
  @ApiProperty({ description: 'User ID to link this tasker profile to' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: ['data-labeling', 'image-annotation'] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ example: 25.0 })
  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 'Experienced data annotator...' })
  @IsString()
  @IsOptional()
  bio?: string;
}