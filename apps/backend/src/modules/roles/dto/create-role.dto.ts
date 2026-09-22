/**
 * CreateRoleDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
