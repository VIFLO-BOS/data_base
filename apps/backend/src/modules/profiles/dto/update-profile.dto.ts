/**
 * UpdateProfileDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
