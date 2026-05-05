/**
 * UpdateTimesheetDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateTimesheetDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
