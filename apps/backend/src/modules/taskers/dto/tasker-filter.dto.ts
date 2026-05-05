/**
 * TaskerFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class TaskerFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
