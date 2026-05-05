/**
 * TaskerResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class TaskerResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
