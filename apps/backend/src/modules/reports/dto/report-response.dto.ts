/**
 * ReportResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class ReportResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
