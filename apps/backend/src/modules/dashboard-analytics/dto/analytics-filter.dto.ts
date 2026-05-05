/**
 * AnalyticsFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class AnalyticsFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
