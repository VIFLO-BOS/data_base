import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { PendingInvitationDto } from './dto/pending-invitation.dto';
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { AdminInvitationEntity } from './entities/admin-invitation.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { ProfileEntity } from '../profiles/entities/profile.entity';
import { MailService } from './mail.service';
import * as crypto from 'crypto';
import { hashPassword } from '../../common/utils/password.utils';
import { AuthService } from '../auth/auth.service';

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
    private authService: AuthService,
  ) {}

  async inviteAdmin(email: string, inviterId: string) {
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
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    if (invitation) {
      if (invitation.acceptedAt) {
        throw new ConflictException('User has already accepted an invitation');
      }
      // Update existing invitation
      invitation.tokenHash = tokenHash;
      invitation.expiresAt = expiresAt;
      invitation.role = 'admin';
      invitation.invitedById = inviterId;
      invitation.revokedAt = null;
    } else {
      // Create new invitation
      invitation = this.invitationsRepo.create({
        email,
        tokenHash,
        role: 'admin',
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
    const invitation = await this.invitationsRepo.findOne({
      where: { tokenHash: this.hashToken(token), revokedAt: IsNull() },
    });
    
    if (!invitation) {
      throw new NotFoundException('Invitation not found or invalid');
    }

    if (invitation.acceptedAt) {
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
        where: {
          tokenHash: this.hashToken(token),
          acceptedAt: IsNull(),
          revokedAt: IsNull(),
        },
        loadEagerRelations: false,
        lock: { mode: 'pessimistic_write' },
      });
      if (!invitation || invitation.expiresAt.getTime() <= Date.now()) {
        throw new BadRequestException('Invalid or expired invitation token');
      }
      if (invitation.role !== 'admin') throw new BadRequestException('Invalid invitation role');
      if (await manager.findOneBy(UserEntity, { email: invitation.email })) throw new ConflictException('User already registered');
      const role = await manager.findOneBy(RoleEntity, { name: invitation.role });
      if (!role) throw new BadRequestException('Invitation role has not been provisioned');
      const user = await manager.save(UserEntity, manager.create(UserEntity, { email: invitation.email, passwordHash, roles: [role] }));
      user.profile = await manager.save(ProfileEntity, manager.create(ProfileEntity, {
        userId: user.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
      }));
      invitation.acceptedAt = new Date();
      await manager.save(AdminInvitationEntity, invitation);
      return this.authService.createAuthenticatedSession(user, manager);
    });
  }

  async getPendingInvitations(): Promise<PendingInvitationDto[]> {
    const invitations = await this.invitationsRepo.find({
      where: { acceptedAt: IsNull(), revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
      relations: ['invitedBy'],
    });
    return invitations.map(invitation => ({
      id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt, createdAt: invitation.createdAt,
      invitedBy: invitation.invitedBy ? { id: invitation.invitedBy.id, email: invitation.invitedBy.email } : null,
    }));

  }

  async resetAdminPassword(requesterId: string, targetEmail: string, newPassword: string) {
    const targetUser = await this.userRepo.findOne({ where: { email: targetEmail.trim().toLowerCase() } });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }
    if (requesterId === targetUser.id) {
      throw new BadRequestException('Use the Change Password feature to update your own password');
    }
    const isAdmin = targetUser.roles?.some(r => r.name === 'admin');
    const isSuperAdmin = targetUser.roles?.some(r => r.name === 'super_admin');
    if (isSuperAdmin) {
      throw new BadRequestException('Super admin passwords cannot be reset by another user');
    }
    if (!isAdmin) {
      throw new BadRequestException('Target user is not an administrator');
    }
    targetUser.passwordHash = await hashPassword(newPassword);
    await this.userRepo.save(targetUser);
    return { message: `Password for ${targetUser.email} has been reset successfully` };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
