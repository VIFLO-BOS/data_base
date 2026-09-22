/**
 * UpdateTimesheetDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class UpdateTimesheetDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
