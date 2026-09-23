import { AuthRateLimitEntity } from './entities/auth-rate-limit.entity';
/**
 * Auth Module
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { SessionEntity } from './entities/session.entity';
import { ProfileEntity } from '../profiles/entities/profile.entity';
import { ClientEntity } from '../clients/entities/client.entity';
import { TaskerEntity } from '../taskers/entities/tasker.entity';
import { AdminInvitationEntity } from '../admins/entities/admin-invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    UserEntity,
    RoleEntity,
    SessionEntity,
    ProfileEntity,
    ClientEntity,
    TaskerEntity,
    AdminInvitationEntity,
    AuthRateLimitEntity,
  ])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
