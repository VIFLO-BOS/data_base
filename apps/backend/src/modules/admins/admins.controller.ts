import { InviteAdminDto } from './dto/invite-admin.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ResetAdminPasswordDto } from './dto/reset-admin-password.dto';
import { Controller, Post, Get, Body, Param, Patch, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post('invite')
  @ApiBearerAuth()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Invite a new admin' })
  inviteAdmin(
    @Body() dto: InviteAdminDto,
    @Request() req: any,
  ) {
    return this.adminsService.inviteAdmin(dto.email, req.user.id);
  }

  @Public()
  @Get('invite/:token')
  @ApiOperation({ summary: 'Validate an invitation token' })
  validateToken(@Param('token') token: string) {
    return this.adminsService.validateToken(token);
  }

  @Public()
  @Post('invite/:token/accept')
  @ApiOperation({ summary: 'Accept an admin invitation' })
  acceptInvitation(@Param('token') token: string, @Body() dto: AcceptInvitationDto) {
    return this.adminsService.acceptInvitation(token, dto);
  }

  @Get('invitations/pending')
  @ApiBearerAuth()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get all pending admin invitations' })
  getPendingInvitations() {
    return this.adminsService.getPendingInvitations();
  }

  @Patch('reset-password')
  @ApiBearerAuth()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Reset an admin\'s password (super admin only)' })
  resetAdminPassword(@Request() req: any, @Body() dto: ResetAdminPasswordDto) {
    return this.adminsService.resetAdminPassword(req.user.id, dto.email, dto.newPassword);
  }
}
