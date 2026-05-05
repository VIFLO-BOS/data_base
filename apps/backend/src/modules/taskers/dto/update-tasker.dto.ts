/**
 * UpdateTaskerDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateTaskerDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
