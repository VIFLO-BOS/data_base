/**
 * AnalyticsResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class AnalyticsResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
