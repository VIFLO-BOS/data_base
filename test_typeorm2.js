const { DataSource } = require('typeorm');

const ds = new DataSource({
  type: 'postgres',
  url: 'postgresql://postgres.cgjbusgkwkiuwamtozqd:EkKgi7LnCa0kEe9v@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
});

ds.initialize().then(async () => {
  const result = await ds.query('SELECT entry_date FROM timesheet_entries WHERE hours_worked IN (24.93, 3.67)');
  console.log(result);
  console.log('typeof entry_date:', typeof result[0].entry_date);
  console.log('is Date:', result[0].entry_date instanceof Date);
  process.exit(0);
}).catch(console.error);
