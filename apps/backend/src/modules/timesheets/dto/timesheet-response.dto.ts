/**
 * TimesheetResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class TimesheetResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
