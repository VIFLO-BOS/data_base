/**
 * CreateRoleDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
