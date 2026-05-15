/**
 * UpdateAdminDto
 * TODO: Define validation rules and fields.
 */

import { PartialType } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {}
