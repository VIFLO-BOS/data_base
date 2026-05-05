/**
 * ClientFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ClientFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
