/**
 * UpdateClientDto
 * TODO: Define validation rules and fields.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}