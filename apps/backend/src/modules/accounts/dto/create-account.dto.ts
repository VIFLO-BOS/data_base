/**
 * CreateAccountDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
