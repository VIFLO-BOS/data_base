/**
 * ProfileResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class ProfileResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
