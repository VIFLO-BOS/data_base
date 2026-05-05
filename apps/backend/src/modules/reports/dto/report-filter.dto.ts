/**
 * ReportFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ReportFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
