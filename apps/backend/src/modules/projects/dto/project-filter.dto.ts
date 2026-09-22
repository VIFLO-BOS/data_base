/**
 * ProjectFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class ProjectFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
