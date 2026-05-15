/**
 * CreateClientDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'User ID to link this client profile to' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: '123 Main St, London' })
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @ApiPropertyOptional({ example: 'bank_transfer' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}