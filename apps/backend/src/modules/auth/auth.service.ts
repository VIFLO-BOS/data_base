/**
 * Auth Service
 * TODO: Implement business logic for auth.
 */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { SessionEntity } from './entities/session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  hashPassword,
  comparePassword,
} from '../../common/utils/password.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity) private roleRepo: Repository<RoleEntity>,
    @InjectRepository(SessionEntity)
    private sessionRepo: Repository<SessionEntity>,
    private config: ConfigService,
  ) {}

  /*
   * Register a new admin user
   */

  async register(dto: RegisterDto) {
    // 1. Check if email already exists
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    // 2. Hash the password
    const passwordHash = await hashPassword(dto.password);

    // 3. Find user
    const userByEmail = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (userByEmail) throw new ConflictException('Email already registered');

    // 4. Create user
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
    });
    await this.userRepo.save(user);

    // 5. Assign 'admin' role
    const adminRole = await this.roleRepo.findOne({ where: { name: 'admin' } });

    if (!adminRole) {
      user.roles = [adminRole];
      await this.userRepo.save(user);
    }

    // 6. Generate Tokens
    const tokens = this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    // 2. Verify password
    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    // 3. Check user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is suspended');
    }

    // 4. Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */

  async refresh(refreshToken: string) {
    try {
      const secret = this.config.get<string>('jwt.secret');
      const payload =jwt.verify(refreshToken,secret) as any;

      if (payload.type !== 'refresh' || !payload.sub) throw new UnauthorizedException('Invalid refresh token');

      const session = await this.sessionRepo.findOne({
        where: {
          tokenHash: await hashPassword(refreshToken),
          userId: payload.sub,
        }
      })

      if (!session) throw new UnauthorizedException('Invalid refresh token');

      if (new Date(session.expiresAt) < new Date()) {
        await this.sessionRepo.delete({ id: session.id });
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get current user profile
   */

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({where:{id:userId}});
    if(!user) throw new UnauthorizedException()
    
    return this.sanitizeUser(user)
  }


    // ---Private Helpers---

  private generateTokens(user: UserEntity) {
    const secret = this.config.get<string>('jwt.secret');
    const roleNames = user.roles.map(r => r.name) || [];


   const accessToken = jwt.sign(
      { sub: user.id, email: user.email, roles: roleNames, type: 'access' },
      secret,
      { expiresIn: this.config.get<string>('jwt.accessExpiration') as any },
    );

    const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, secret, {
      expiresIn: this.config.get<string>('jwt.refreshExpiration') as any,
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user:UserEntity) {
    const {passwordHash, ...safe} = user;
    return {
      ...safe,
      roles: user.roles.map((r: RoleEntity) => r.name) || [],
    };
  }

}
