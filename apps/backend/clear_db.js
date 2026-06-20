const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.cgjbusgkwkiuwamtozqd:EkKgi7LnCa0kEe9v@aws-1-eu-central-1.pooler.supabase.com:6543/postgres'
});

async function clearDB() {
  try {
    await client.connect();
    
    // Get all tables in public schema
    const res = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const tables = res.rows.map(r => r.tablename);
    
    if (tables.length === 0) {
      console.log('No tables found in public schema.');
      return;
    }

    console.log(`Found ${tables.length} tables to truncate.`);
    
    // Create and execute truncate query
    const truncateQuery = `TRUNCATE TABLE ${tables.map(t => '"' + t + '"').join(', ')} CASCADE;`;
    await client.query(truncateQuery);
    
    console.log('All tables truncated successfully.');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await client.end();
  }
}

clearDB();
