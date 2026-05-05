/**
 * CreateTaskerDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateTaskerDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
