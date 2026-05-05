/**
 * CreateUserDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
