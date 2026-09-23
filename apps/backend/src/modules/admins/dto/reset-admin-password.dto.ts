import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetAdminPasswordDto {
  @ApiProperty({ example: 'admin@paylio.com', description: 'Target admin email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'NewP@ss1' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(16, { message: 'Password must be at most 16 characters' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  newPassword: string;
}

