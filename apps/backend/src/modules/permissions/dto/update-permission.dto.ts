/**
 * UpdatePermissionDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
