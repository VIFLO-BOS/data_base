/**
 * AdminResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class AdminResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
