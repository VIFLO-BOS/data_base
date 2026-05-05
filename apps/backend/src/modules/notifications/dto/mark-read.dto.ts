/**
 * MarkReadDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class MarkReadDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
