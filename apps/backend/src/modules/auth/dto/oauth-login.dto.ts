import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
export class OAuthLoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(16384)
  accessToken: string;

  @IsIn(['client', 'tasker'])
  role: string;
}
