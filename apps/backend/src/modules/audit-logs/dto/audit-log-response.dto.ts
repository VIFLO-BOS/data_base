/**
 * AuditLogResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class AuditLogResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
