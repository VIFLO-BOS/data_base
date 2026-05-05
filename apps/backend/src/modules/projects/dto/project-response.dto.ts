/**
 * ProjectResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ProjectResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
