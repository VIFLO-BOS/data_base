/**
 * RegisterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
