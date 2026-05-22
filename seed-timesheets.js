const { Client } = require('pg');
const crypto = require('crypto');

async function run() {
  const c = new Client({
    host: 'aws-1-eu-central-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.cgjbusgkwkiuwamtozqd',
    password: 'EkKgi7LnCa0kEe9v',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  await c.connect();

  console.log('Fetching taskers...');
  const taskers = await c.query('SELECT id FROM taskers LIMIT 1;');
  if (taskers.rowCount === 0) {
    console.log('No taskers found. Exiting.');
    return c.end();
  }
  const taskerId = taskers.rows[0].id;

  console.log('Fetching projects...');
  const projects = await c.query('SELECT id FROM projects LIMIT 1;');
  const projectId = projects.rowCount > 0 ? projects.rows[0].id : null;

  // Insert a timesheet for the current week
  const tsId = crypto.randomUUID();
  const d = new Date();
  const diffToMonday = d.getDay() === 0 ? -6 : 1 - d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const weekStarting = monday.toISOString().split('T')[0];

  console.log('Inserting timesheet...');
  await c.query(`
    INSERT INTO timesheets (id, tasker_id, project_id, status, total_hours, week_starting, created_at, updated_at)
    VALUES ($1, $2, $3, 'approved', 8.5, $4, NOW(), NOW())
  `, [tsId, taskerId, projectId, weekStarting]);

  // Insert entry for today
  const entryId = crypto.randomUUID();
  const today = new Date().toISOString().split('T')[0];
  console.log('Inserting entry...');
  await c.query(`
    INSERT INTO timesheet_entries (id, timesheet_id, entry_date, hours_worked, task_description, created_at, updated_at)
    VALUES ($1, $2, $3, 8.5, 'Test task for today', NOW(), NOW())
  `, [entryId, tsId, today]);

  console.log('Done!');
  await c.end();
}

run().catch(console.error);
