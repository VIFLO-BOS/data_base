import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { PendingInvitationDto } from './dto/pending-invitation.dto';
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminInvitationEntity } from './entities/admin-invitation.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { ProfileEntity } from '../profiles/entities/profile.entity';
import { MailService } from './mail.service';
import * as crypto from 'crypto';
import { hashPassword } from '../../common/utils/password.utils';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminInvitationEntity)
    private invitationsRepo: Repository<AdminInvitationEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepo: Repository<ProfileEntity>,
    private mailService: MailService,
  ) {}

  async inviteAdmin(email: string, role: string, inviterId: string) {
    if (role !== 'admin') throw new BadRequestException('Only admin invitations are supported');
    email = email.trim().toLowerCase();
    // 1. Check if user already exists
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    // 2. Check if pending invitation exists
    let invitation = await this.invitationsRepo.findOne({ where: { email } });
    
    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    if (invitation) {
      if (invitation.accepted) {
        throw new ConflictException('User has already accepted an invitation');
      }
      // Update existing invitation
      invitation.token = token;
      invitation.expiresAt = expiresAt;
      invitation.role = role || 'admin';
      invitation.invitedById = inviterId;
    } else {
      // Create new invitation
      invitation = this.invitationsRepo.create({
        email,
        token,
        role: role || 'admin',
        invitedById: inviterId,
        expiresAt,
      });
    }

    await this.invitationsRepo.save(invitation);

    // Send email
    await this.mailService.sendAdminInvitation(email, token);

    return { message: 'Invitation sent successfully' };
  }

  async validateToken(token: string) {
    const invitation = await this.invitationsRepo.findOne({ where: { token } });
    
    if (!invitation) {
      throw new NotFoundException('Invitation not found or invalid');
    }

    if (invitation.accepted) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      throw new BadRequestException('Invitation has expired');
    }

    return { email: invitation.email, role: invitation.role };
  }

  async acceptInvitation(token: string, payload: AcceptInvitationDto) {
    const passwordHash = await hashPassword(payload.password);
    return this.invitationsRepo.manager.transaction(async manager => {
      const invitation = await manager.findOne(AdminInvitationEntity, {
        where: { token }, loadEagerRelations: false, lock: { mode: 'pessimistic_write' },
      });
      if (!invitation || invitation.accepted || invitation.expiresAt.getTime() <= Date.now()) {
        throw new BadRequestException('Invalid or expired invitation token');
      }
      if (!['admin'].includes(invitation.role)) throw new BadRequestException('Invalid invitation role');
      if (await manager.findOneBy(UserEntity, { email: invitation.email })) throw new ConflictException('User already registered');
      const role = await manager.findOneBy(RoleEntity, { name: invitation.role });
      if (!role) throw new BadRequestException('Invitation role has not been provisioned');
      const user = await manager.save(UserEntity, manager.create(UserEntity, { email: invitation.email, passwordHash, roles: [role] }));
      await manager.save(ProfileEntity, manager.create(ProfileEntity, { userId: user.id, firstName: payload.firstName, lastName: payload.lastName }));
      invitation.accepted = true;
      await manager.save(AdminInvitationEntity, invitation);
      return { message: 'Admin account created successfully' };
    });
  }

  async getPendingInvitations(): Promise<PendingInvitationDto[]> {
    const invitations = await this.invitationsRepo.find({
      where: { accepted: false },
      order: { createdAt: 'DESC' },
      relations: ['invitedBy'],
    });
    return invitations.map(invitation => ({
      id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt, createdAt: invitation.createdAt,
      invitedBy: invitation.invitedBy ? { id: invitation.invitedBy.id, email: invitation.invitedBy.email } : null,
    }));

  }
}