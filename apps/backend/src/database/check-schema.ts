import { AppDataSource } from './data-source';
async function check() {
  await AppDataSource.initialize();
  try {
    const diff = await AppDataSource.driver.createSchemaBuilder().log();
    if (diff.upQueries.length) {
      console.error('Schema differs from application entities. Review a generated migration on a database clone before release.');
      for (const query of diff.upQueries) console.error(query.query);
      process.exitCode = 1;
    } else console.log('Database schema matches application entities.');
  } finally { await AppDataSource.destroy(); }
}
check().catch(error => { console.error(error.message); process.exitCode = 1; });
