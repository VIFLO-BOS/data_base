/**
 * UserResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class UserResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
