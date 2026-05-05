/**
 * NotificationFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class NotificationFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
