/**
 * RegisterDto
 * TODO: Define validation rules and fields.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
export class RegisterDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(16, { message: 'Password must be at most 16 characters' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ example: 'tasker', description: 'Role to register as (client or tasker)' })
  @IsString()
  @Matches(/^(client|tasker|admin)$/, { message: 'Role must be either client, tasker, or admin' })
  role: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Profile image URL or Base64' })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
