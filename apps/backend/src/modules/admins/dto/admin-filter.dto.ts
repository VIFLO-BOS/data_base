/**
 * AdminFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class AdminFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
