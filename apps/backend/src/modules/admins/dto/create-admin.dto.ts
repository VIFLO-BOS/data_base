/**
 * CreateAdminDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
