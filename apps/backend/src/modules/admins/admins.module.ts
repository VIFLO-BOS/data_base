/**
 * Admins Module
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { ProfileEntity } from '../profiles/entities/profile.entity';
import { AdminInvitationEntity } from './entities/admin-invitation.entity';
import { MailService } from './mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, ProfileEntity, AdminInvitationEntity])],
  controllers: [AdminsController],
  providers: [AdminsService, MailService],
  exports: [AdminsService],
})
export class AdminsModule {}