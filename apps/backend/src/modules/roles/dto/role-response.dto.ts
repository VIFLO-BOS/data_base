/**
 * RoleResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class RoleResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
