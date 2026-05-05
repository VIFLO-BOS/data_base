/**
 * CreateTimesheetDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateTimesheetDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
