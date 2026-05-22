/**
 * UpdateTaskerDto
 * TODO: Define validation rules and fields.
 */

import { IsString, IsOptional, IsNumber, IsArray, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskerDto {
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

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountNumber?: string;

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
