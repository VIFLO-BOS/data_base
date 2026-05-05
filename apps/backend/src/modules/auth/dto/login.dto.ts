/**
 * LoginDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
