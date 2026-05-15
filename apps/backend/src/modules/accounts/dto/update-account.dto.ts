/**
 * UpdateAccountDto
 * TODO: Define validation rules and fields.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}