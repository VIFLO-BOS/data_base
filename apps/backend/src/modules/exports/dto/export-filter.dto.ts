/**
 * ExportFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ExportFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
