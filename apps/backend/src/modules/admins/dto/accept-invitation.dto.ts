import { PickType } from '@nestjs/swagger';
import { RegisterDto } from '../../auth/dto/register.dto';
export class AcceptInvitationDto extends PickType(RegisterDto, ['password', 'firstName', 'lastName'] as const) {}
