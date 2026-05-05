/**
 * AccountResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class AccountResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
