/**
 * CreateAdminDto
 * TODO: Define validation rules and fields.
 */

import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ description: 'User ID to link this admin profile to' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ enum: ['standard', 'elevated', 'super'] })
  @IsOptional()
  @IsIn(['standard', 'elevated', 'super'])
  accessLevel?: string;
}