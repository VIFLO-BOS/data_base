const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    
    const email = 'arenixcommunication@gmail.com';
    const roleName = 'super_admin';

    // Find user
    const userRes = await client.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.log(`User ${email} not found!`);
      return;
    }
    const userId = userRes.rows[0].id;
    console.log(`User found: ${userId} (${email})`);

    // Find role
    const roleRes = await client.query('SELECT id, name FROM roles WHERE name = $1', [roleName]);
    let roleId;
    
    if (roleRes.rows.length === 0) {
      console.log(`Role '${roleName}' not found! Creating it...`);
      const newRoleRes = await client.query('INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id', [roleName, 'Super Administrator']);
      roleId = newRoleRes.rows[0].id;
      console.log(`Created role '${roleName}' with ID: ${roleId}`);
    } else {
      roleId = roleRes.rows[0].id;
      console.log(`Role '${roleName}' found: ${roleId}`);
    }

    // Check if already assigned
    const userRoleRes = await client.query('SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2', [userId, roleId]);
    if (userRoleRes.rows.length > 0) {
      console.log(`User already has '${roleName}' role.`);
    } else {
      // Insert into user_roles
      await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);
      console.log(`Successfully assigned '${roleName}' role to user ${email}.`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
