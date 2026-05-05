/**
 * ClientResponseDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ClientResponseDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
