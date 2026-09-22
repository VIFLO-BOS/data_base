/**
 * OauthCallbackDto
 * TODO: Define validation rules and fields.
 */
import { IsString, IsOptional } from 'class-validator';

export class OauthCallbackDto {
  @IsString()
  @IsOptional()
  placeholder?: string;
}
