/**
 * ApproveTimesheetDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class ApproveTimesheetDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
