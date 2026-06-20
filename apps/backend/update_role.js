const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    
    // Check if user exists
    const userRes = await client.query('SELECT id, email, roles FROM users WHERE email = $1', ['arenixcommunication@gmail.com']);
    
    if (userRes.rows.length === 0) {
      console.log('User not found!');
    } else {
      console.log('User before update:', userRes.rows[0]);
      
      // Update role
      // Assuming roles is an array of strings like text[] or jsonb
      const updateRes = await client.query(
        "UPDATE users SET roles = '{\"super_admin\"}' WHERE email = $1 RETURNING id, email, roles",
        ['arenixcommunication@gmail.com']
      );
      console.log('User after update:', updateRes.rows[0]);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
