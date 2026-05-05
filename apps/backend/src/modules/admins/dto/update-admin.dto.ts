/**
 * UpdateAdminDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
