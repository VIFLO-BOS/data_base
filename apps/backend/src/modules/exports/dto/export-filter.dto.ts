/**
 * ExportFilterDto
 * TODO: Define validation rules and fields.
 */
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportFilterDto {
  @ApiPropertyOptional({
    enum: ['queued', 'processing', 'completed', 'failed'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['queued', 'processing', 'completed', 'failed'])
  status?: string;

  @ApiPropertyOptional({ enum: ['csv', 'json'] })
  @IsOptional()
  @IsString()
  type?: string;
}