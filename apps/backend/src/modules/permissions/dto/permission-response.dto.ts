/**
 * PermissionResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class PermissionResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
