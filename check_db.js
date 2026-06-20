const { Client } = require('pg');
const client = new Client({
  connectionString:
    'postgresql://postgres.cgjbusgkwkiuwamtozqd:EkKgi7LnCa0kEe9v@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
});
client
  .connect()
  .then(() =>
    client.query(
      'SELECT e.id, e.entry_date, e.hours_worked, t.week_starting, t.id as ts_id, u.first_name, u.last_name FROM timesheet_entries e JOIN timesheets t ON e.timesheet_id = t.id JOIN taskers tsk ON t.tasker_id = tsk.id JOIN users u ON tsk.user_id = u.id ORDER BY e.created_at DESC LIMIT 15',
    ),
  )
  .then((res) => {
    console.log(JSON.stringify(res.rows, null, 2));
    client.end();
  })
  .catch((err) => {
    console.error(err);
    client.end();
  });
