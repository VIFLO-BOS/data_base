/**
 * CreateProfileDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
