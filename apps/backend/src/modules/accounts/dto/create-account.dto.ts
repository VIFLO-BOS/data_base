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

  @ApiPropertyOptional({ example: 'contact@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'enterprise' })
  @IsString()
  @IsOptional()
  type?: string;
}