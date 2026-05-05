/**
 * TimesheetFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class TimesheetFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
