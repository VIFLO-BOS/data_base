/**
 * CreatePermissionDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
