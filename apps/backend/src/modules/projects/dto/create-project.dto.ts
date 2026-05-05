/**
 * CreateProjectDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
