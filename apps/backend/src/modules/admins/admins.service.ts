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

  async acceptInvitation(token: string, payload: any) {
    const invitation = await this.invitationsRepo.findOne({ where: { token } });
    
    if (!invitation || invitation.accepted || new Date() > new Date(invitation.expiresAt)) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // 1. Check if email already registered somehow
    const existing = await this.userRepo.findOne({ where: { email: invitation.email } });
    if (existing) {
      throw new ConflictException('User already registered');
    }

    // 2. Hash the password
    const passwordHash = await hashPassword(payload.password);

    // 3. Create user
    const user = this.userRepo.create({
      email: invitation.email,
      passwordHash,
    });
    await this.userRepo.save(user);

    // 4. Create profile
    const profile = this.profileRepo.create({
      userId: user.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
    await this.profileRepo.save(profile);
    user.profile = profile;

    // 5. Assign role
    const userRole = await this.roleRepo.findOne({ where: { name: invitation.role } });
    if (userRole) {
      user.roles = [userRole];
      await this.userRepo.save(user);
    }

    // 6. Mark invitation as accepted
    invitation.accepted = true;
    await this.invitationsRepo.save(invitation);

    return { message: 'Admin account created successfully' };
  }
}