/**
 * BulkCreateTaskerDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class BulkCreateTaskerDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
