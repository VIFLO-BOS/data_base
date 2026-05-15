/**
 * MarkReadDto
 * TODO: Define validation rules and fields.
 */

import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({ description: 'Array of notification IDs to mark as read' })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}