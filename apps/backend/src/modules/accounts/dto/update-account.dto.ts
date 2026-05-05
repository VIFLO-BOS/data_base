/**
 * UpdateAccountDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
