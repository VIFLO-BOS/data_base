/**
 * RefreshTokenDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
