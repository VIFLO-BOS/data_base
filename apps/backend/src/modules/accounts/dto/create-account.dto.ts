/**
 * CreateAccountDto
 * TODO: Define validation rules and fields.
 */

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: 'MAGS Corp' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'enterprise' })
  @IsString()
  @IsOptional()
  type?: string;
}