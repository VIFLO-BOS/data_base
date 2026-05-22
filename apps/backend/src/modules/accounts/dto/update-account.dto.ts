/**
 * UpdateAccountDto
 * TODO: Define validation rules and fields.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';
import { IsOptional, IsObject } from 'class-validator';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}