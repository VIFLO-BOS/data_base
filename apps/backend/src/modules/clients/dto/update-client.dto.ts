/**
 * UpdateClientDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
