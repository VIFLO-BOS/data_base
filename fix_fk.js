const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.cgjbusgkwkiuwamtozqd:EkKgi7LnCa0kEe9v@aws-1-eu-central-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  try {
    await client.query('ALTER TABLE tasker_payments DROP CONSTRAINT IF EXISTS "FK_35aa118f0b90e141a8eb827c6de"');
    console.log('Dropped constraint FK_35aa118f0b90e141a8eb827c6de');
  } catch (err) {
    console.error('Error dropping constraint:', err.message);
  }

  // We should also look up the foreign keys and drop them dynamically if we don't know the exact name of the tasker constraint
  try {
    const result = await client.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'tasker_payments'::regclass
      AND contype = 'f'
    `);
    
    for (const row of result.rows) {
      console.log('Dropping constraint:', row.conname);
      await client.query(`ALTER TABLE tasker_payments DROP CONSTRAINT "${row.conname}"`);
    }
    
    console.log('Done dropping FK constraints. TypeORM will recreate them on restart.');
  } catch (err) {
    console.error('Error finding/dropping constraints:', err.message);
  } finally {
    await client.end();
  }
}

run();
