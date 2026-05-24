/**
 * CreateTimesheetDto
 * TODO: Define validation rules and fields.
 */

import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimesheetEntryDto {
  @ApiProperty({ example: '2026-05-05' })
  @IsDateString()
  entryDate: string;

  @ApiProperty({ example: 8.0 })
  @IsNumber()
  hoursWorked: number;

  @ApiPropertyOptional({ example: 'Labeled 500 images' })
  @IsString()
  @IsOptional()
  taskDescription?: string;
}

export class CreateTimesheetDto {
  @ApiProperty()
  @IsString()
  taskerId: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty({ example: '2026-05-05' })
  @IsDateString()
  weekStarting: string;

  @ApiProperty({ type: [TimesheetEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimesheetEntryDto)
  entries: TimesheetEntryDto[];
}