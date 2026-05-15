/**
 * RefreshTokenDto
 * TODO: Define validation rules and fields.
 */
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
