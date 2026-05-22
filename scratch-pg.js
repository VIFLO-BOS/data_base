const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres.cgjbusgkwkiuwamtozqd:EkKgi7LnCa0kEe9v@aws-1-eu-central-1.pooler.supabase.com:6543/annotator_platform',
  });
  await client.connect();
  const res = await client.query('SELECT week_starting FROM timesheets LIMIT 5');
  console.log('timesheets week_starting:', res.rows);
  const res2 = await client.query('SELECT "entryDate" FROM timesheet_entries LIMIT 5');
  console.log('entries entryDate:', res2.rows);
  await client.end();
}
check();
