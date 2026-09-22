import { AppDataSource } from '../data-source';
import { seedRoles } from './roles.seed';
import { seedAdmin } from './admin.seed';

async function runSeeds() {
  await AppDataSource.initialize();
  try {
    await AppDataSource.transaction(async manager => {
      await manager.query("SELECT pg_advisory_xact_lock(hashtext('annotator-bootstrap'))");
      await seedRoles(manager);
      await seedAdmin(manager);
    });
    console.log('Role/permission provisioning completed. Bootstrap ran only if explicitly enabled.');
  } finally { await AppDataSource.destroy(); }
}
runSeeds().catch(error => { console.error(error.message); process.exitCode = 1; });
