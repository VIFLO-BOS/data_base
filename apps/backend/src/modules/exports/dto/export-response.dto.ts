/**
 * ExportResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ExportResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
