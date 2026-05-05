/**
 * CreateNotificationDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
