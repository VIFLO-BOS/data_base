/**
 * AuditLogFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class AuditLogFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
