/**
 * ProjectStatusDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class ProjectStatusDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
