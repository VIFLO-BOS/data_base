import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, MoreThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { createHash, randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { SessionEntity } from './entities/session.entity';
import { ProfileEntity } from '../profiles/entities/profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { hashPassword, comparePassword } from '../../common/utils/password.utils';
import { ClientEntity } from '../clients/entities/client.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { AdminInvitationEntity } from '../admins/entities/admin-invitation.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity) private roleRepo: Repository<RoleEntity>,
    @InjectRepository(SessionEntity) private sessionRepo: Repository<SessionEntity>,
    @InjectRepository(ProfileEntity) private profileRepo: Repository<ProfileEntity>,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    this.assertPublicRole(dto.role);
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await hashPassword(dto.password);
    return this.userRepo.manager.transaction(async manager => {
      await this.assertNoPendingAdminInvitation(manager, email);
      if (await manager.findOneBy(UserEntity, { email })) throw new ConflictException('Email already registered');
      const role = await this.requireRole(manager, dto.role);
      const user = await manager.save(UserEntity, manager.create(UserEntity, { email, passwordHash, roles: [role] }));
      user.profile = await manager.save(ProfileEntity, manager.create(ProfileEntity, {
        userId: user.id, firstName: dto.firstName, lastName: dto.lastName,
      }));
      await this.provisionRoleRecord(manager, user, dto.role, dto.firstName, dto.lastName);
      return { user: this.sanitizeUser(user), ...await this.generateTokens(user, manager) };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.trim().toLowerCase() },
      select: { id: true, email: true, passwordHash: true, status: true, createdAt: true, updatedAt: true },
    });
    if (!user?.passwordHash || !await comparePassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    this.assertActive(user);
    return { user: this.sanitizeUser(user), ...await this.generateTokens(user, this.userRepo.manager) };
  }

  async oauthLogin(dto: OAuthLoginDto) {
    this.assertPublicRole(dto.role);
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_ANON_KEY');
    if (!url || !key) throw new ServiceUnavailableException('OAuth is not configured');
    if (!dto.accessToken) throw new UnauthorizedException('Provider token required');
    const provider = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5000) }) },
    });
    const { data, error } = await provider.auth.getUser(dto.accessToken);
    if (error || !data.user?.id || !data.user.email || !data.user.email_confirmed_at) {
      throw new UnauthorizedException('Invalid or unverified provider identity');
    }
    const identity = data.user;
    const email = identity.email!.toLowerCase();
    return this.userRepo.manager.transaction(async manager => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [identity.id]);
      let user = await manager.findOne(UserEntity, { where: { supabaseUserId: identity.id } });
      if (!user) {
        await this.assertNoPendingAdminInvitation(manager, email);
        // Existing password accounts need a separate authenticated linking flow.
        if (await manager.findOneBy(UserEntity, { email })) {
          throw new ConflictException('An account with this email exists. Sign in with your password.');
        }
        const role = await this.requireRole(manager, dto.role);
        user = await manager.save(UserEntity, manager.create(UserEntity, {
          email,
          supabaseUserId: identity.id,
          emailVerifiedAt: new Date(identity.email_confirmed_at),
          roles: [role],
        }));
        const name = String(identity.user_metadata?.full_name || identity.user_metadata?.user_name || email.split('@')[0]).slice(0, 255).trim().split(/\s+/);
        user.profile = await manager.save(ProfileEntity, manager.create(ProfileEntity, {
          userId: user.id, firstName: name[0] || 'User', lastName: name.slice(1).join(' ') || name[0] || 'User',
        }));
        await this.provisionRoleRecord(
          manager,
          user,
          dto.role,
          user.profile.firstName,
          user.profile.lastName,
        );
      } else if (user.roles.some(role => role.name === 'admin' || role.name === 'super_admin')) {
        throw new UnauthorizedException('Administrator accounts must sign in with their password');
      }
      this.assertActive(user);
      return { user: this.sanitizeUser(user), ...await this.generateTokens(user, manager) };
    });
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyRefresh(refreshToken);
    return this.sessionRepo.manager.transaction(async manager => {
      const session = await manager.findOne(SessionEntity, {
        where: { id: payload.jti, userId: payload.sub, tokenHash: this.digest(refreshToken) },
        lock: { mode: 'pessimistic_write' },
      });
      if (!session || session.expiresAt.getTime() <= Date.now()) throw new UnauthorizedException('Invalid refresh session');
      const user = await manager.findOne(UserEntity, { where: { id: payload.sub } });
      this.assertActive(user);
      await manager.delete(SessionEntity, session.id);
      return this.generateTokens(user, manager);
    });
  }

  async logout(refreshToken: string) {
    await this.sessionRepo.delete({ tokenHash: this.digest(refreshToken) });
    return { message: 'Session revoked' };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    this.assertActive(user);
    return this.sanitizeUser(user);
  }

  async createAuthenticatedSession(user: UserEntity, manager: EntityManager) {
    this.assertActive(user);
    return { user: this.sanitizeUser(user), ...await this.generateTokens(user, manager) };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true, status: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    this.assertActive(user);
    if (!user.passwordHash || !await comparePassword(currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    user.passwordHash = await hashPassword(newPassword);
    await this.userRepo.save(user);
    return { message: 'Password changed successfully' };
  }

  private verifyRefresh(token: string): jwt.JwtPayload & { sub: string; jti: string } {
    try {
      const payload = jwt.verify(token, this.config.getOrThrow<string>('jwt.secret'), { algorithms: ['HS256'] });
      if (typeof payload === 'string' || payload.type !== 'refresh' || typeof payload.sub !== 'string' || typeof payload.jti !== 'string' ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.sub) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.jti)) throw new Error('Invalid purpose or subject');
      return payload as jwt.JwtPayload & { sub: string; jti: string };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: UserEntity, manager: EntityManager) {
    const secret = this.config.getOrThrow<string>('jwt.secret');
    const id = randomUUID();
    const accessToken = jwt.sign({ sub: user.id, type: 'access' }, secret, {
      algorithm: 'HS256', expiresIn: this.config.getOrThrow('jwt.accessExpiration') as jwt.SignOptions['expiresIn'],
    });
    const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, secret, {
      algorithm: 'HS256', jwtid: id, expiresIn: this.config.getOrThrow('jwt.refreshExpiration') as jwt.SignOptions['expiresIn'],
    });
    const { exp } = jwt.decode(refreshToken) as jwt.JwtPayload;
    await manager.save(SessionEntity, manager.create(SessionEntity, {
      id, userId: user.id, tokenHash: this.digest(refreshToken), expiresAt: new Date(exp! * 1000),
    }));
    return { accessToken, refreshToken };
  }

  private digest(token: string) { return createHash('sha256').update(token).digest('hex'); }
  private assertPublicRole(role: string) {
    if (!['client', 'tasker'].includes(role)) throw new BadRequestException('Role must be client or tasker');
  }
  private assertActive(user: UserEntity) {
    if (!user || user.status !== 'active') throw new UnauthorizedException('User not found or inactive');
  }
  private async requireRole(manager: EntityManager, name: string) {
    const role = await manager.findOneBy(RoleEntity, { name });
    if (!role) throw new ServiceUnavailableException('Account roles have not been provisioned');
    return role;
  }

  private async assertNoPendingAdminInvitation(manager: EntityManager, email: string) {
    const invitation = await manager.findOne(AdminInvitationEntity, {
      where: {
        email,
        acceptedAt: IsNull(),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      loadEagerRelations: false,
    });
    if (invitation) {
      throw new ConflictException(
        'This email has a pending administrator invitation. Use the invitation link to create your account.',
      );
    }
  }

  private async provisionRoleRecord(
    manager: EntityManager,
    user: UserEntity,
    role: string,
    firstName: string,
    lastName: string,
  ) {
    if (role === 'client') {
      await manager.save(ClientEntity, manager.create(ClientEntity, { userId: user.id }));
      return;
    }
    if (role === 'tasker') {
      await manager.save(TaskerEntity, manager.create(TaskerEntity, {
        userId: user.id,
        firstName,
        lastName,
        email: user.email,
      }));
    }
  }
  private sanitizeUser(user: UserEntity) {
    return {
      id: user.id, email: user.email, status: user.status,
      firstName: user.profile?.firstName, lastName: user.profile?.lastName, profileImage: user.profile?.avatarUrl,
      profile: user.profile, roles: user.roles?.map(r => r.name) || [], createdAt: user.createdAt, updatedAt: user.updatedAt,
    };
  }
}
