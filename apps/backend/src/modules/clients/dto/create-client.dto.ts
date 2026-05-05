/**
 * CreateClientDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
