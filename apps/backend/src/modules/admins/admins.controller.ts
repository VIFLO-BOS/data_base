import { Controller, Post, Get, Body, Param, Request } from '@nestjs/common';
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
  inviteAdmin(@Body() dto: { email: string; role: string }, @Request() req: any) {
    return this.adminsService.inviteAdmin(dto.email, dto.role, req.user.id);
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
  acceptInvitation(@Param('token') token: string, @Body() dto: any) {
    return this.adminsService.acceptInvitation(token, dto);
  }
}