/**
 * AccountFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class AccountFilterDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
