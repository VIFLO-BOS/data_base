/**
 * ForgotPasswordDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
