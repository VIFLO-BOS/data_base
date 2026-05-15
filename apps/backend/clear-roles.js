const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query('TRUNCATE TABLE permissions CASCADE;');
    console.log('Cleared permissions table');
    await client.query('TRUNCATE TABLE roles CASCADE;');
    console.log('Cleared roles table');
  } catch (err) {
    console.error('Error clearing table:', err);
  } finally {
    await client.end();
  }
}

run();
