const { DataSource } = require('typeorm');
const { TimesheetEntryEntity } = require('./apps/backend/src/modules/timesheets/entities/timesheet-entry.entity');
const { TimesheetEntity } = require('./apps/backend/src/modules/timesheets/entities/timesheet.entity');
const { TaskerEntity } = require('./apps/backend/src/modules/taskers/entities/tasker.entity');
const { ProjectEntity } = require('./apps/backend/src/modules/projects/entities/project.entity');
const { AccountEntity } = require('./apps/backend/src/modules/accounts/entities/account.entity');
const { UserEntity } = require('./apps/backend/src/modules/users/entities/user.entity');

const ds = new DataSource({
  type: 'postgres',
  url: 'postgresql://postgres.cgjbusgkwkiuwamtozqd:EkKgi7LnCa0kEe9v@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
  entities: [TimesheetEntryEntity, TimesheetEntity, TaskerEntity, ProjectEntity, AccountEntity, UserEntity],
});

ds.initialize().then(async () => {
  const entries = await ds.manager.find(TimesheetEntryEntity, {
    order: { createdAt: 'DESC' },
    take: 5
  });
  entries.forEach(e => {
    console.log(`ID: ${e.id}`);
    console.log(`entryDate: ${e.entryDate}`);
    console.log(`typeof entryDate: ${typeof e.entryDate}`);
    console.log(`instanceof Date: ${e.entryDate instanceof Date}`);
    console.log('---');
  });
  process.exit(0);
}).catch(console.error);
