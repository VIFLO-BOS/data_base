/**
 * ResetPasswordDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
