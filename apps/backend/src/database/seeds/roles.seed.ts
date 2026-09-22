import { EntityManager } from 'typeorm';
import { ROLE_HIERARCHY, PERMISSIONS } from '@annotator/shared-rbac';
import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { PermissionEntity } from '../../modules/permissions/entities/permission.entity';

export async function seedRoles(manager: EntityManager) {
  for (const name of Object.keys(ROLE_HIERARCHY)) {
    if (!await manager.findOneBy(RoleEntity, { name })) await manager.save(RoleEntity, manager.create(RoleEntity, { name }));
  }
  for (const permission of Object.values(PERMISSIONS)) {
    const [resource, action] = permission.split(':');
    if (!await manager.findOneBy(PermissionEntity, { resource, action })) {
      await manager.save(PermissionEntity, manager.create(PermissionEntity, { resource, action }));
    }
  }
}
