# Database Migrations

Migration naming convention: `YYYYMMDDHHMMSS_migration_name.ts`

Use TypeORM CLI to generate migrations:
```bash
cd apps/backend
npm run migration:generate -- -n MigrationName
npm run migration:run
```
