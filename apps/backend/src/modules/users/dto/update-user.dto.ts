/**
 * UpdateUserDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;
}