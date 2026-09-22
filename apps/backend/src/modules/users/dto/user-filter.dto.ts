/**
 * UserFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class UserFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
