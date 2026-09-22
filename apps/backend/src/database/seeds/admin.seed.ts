import { EntityManager } from 'typeorm';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { ProfileEntity } from '../../modules/profiles/entities/profile.entity';
import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { hashPassword } from '../../common/utils/password.utils';

export async function seedAdmin(manager: EntityManager, env: NodeJS.ProcessEnv = process.env) {
  if (env.BOOTSTRAP_ADMIN !== 'true') return;
  const email = env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.BOOTSTRAP_ADMIN_PASSWORD;
  const firstName = env.BOOTSTRAP_ADMIN_FIRST_NAME?.trim();
  const lastName = env.BOOTSTRAP_ADMIN_LAST_NAME?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password ||
      !/^(?=.*[A-Z])(?=.*[0-9]).{8,16}$/.test(password) || !firstName || !lastName) {
    throw new Error('Bootstrap requires valid email, names, and an 8-16 character password with uppercase and number');
  }
  const existing = await manager.findOne(UserEntity, { where: { email } });
  if (existing) {
    if (!existing.roles.some(role => role.name === 'super_admin')) throw new Error('Refusing to elevate an existing account');
    return; // Never reset existing credentials.
  }
  if (await manager.getRepository(UserEntity).createQueryBuilder('user').innerJoin('user.roles', 'role').where('role.name = :name', { name: 'super_admin' }).getExists()) {
    throw new Error('Initial super-admin already exists; use the managed administration flow');
  }
  const role = await manager.findOneByOrFail(RoleEntity, { name: 'super_admin' });
  const user = await manager.save(UserEntity, manager.create(UserEntity, { email, passwordHash: await hashPassword(password), roles: [role] }));
  await manager.save(ProfileEntity, manager.create(ProfileEntity, { userId: user.id, firstName, lastName }));
}
