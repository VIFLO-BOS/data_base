# Database releases

The versioned TypeORM migration in `apps/backend/src/database/migrations` is generated from all current entities, including invitations, sessions, assignment history, and tasker payments. The older SQL files in `database/schemas` and `database/supabase/schema.sql` are historical references and are not a deployment baseline.

For a new, empty database, configure `DATABASE_MIGRATION_URL` with a direct PostgreSQL connection, `DATABASE_SSL=true`, and a provider CA through `DATABASE_SSL_CA` if required. Then run from the repository root:

```sh
npm ci
npm run build:shared
npm run db:migrate
npm run db:seed
npm run schema:check --workspace=apps/backend
```

Runtime uses `DATABASE_URL` (transaction pooling for transient/serverless connections) with a default maximum of 3 connections. Runtime and migration clients share verified TLS settings; URL SSL parameters are deliberately rejected so they cannot override CA validation. Neither builds nor API startup run migrations or seeds. Schema synchronization is always disabled.

To provision the first super-admin, set `BOOTSTRAP_ADMIN=true` and the four `BOOTSTRAP_ADMIN_*` identity/credential values listed in the backend example, then run the seed command once. Supply secrets through protected environment input. Remove bootstrap credentials afterward. Repeating the seed is safe: it neither duplicates users/roles nor resets credentials or elevates a pre-existing ordinary account. Permissions are provisioned idempotently; enforcement uses the shared versioned role-permission map.

## Existing databases

Back up and restore the database to an isolated clone first. Do not apply the initial migration to populated tables, enable synchronization, or mark the initial migration as applied merely because tables exist.

1. Run `npm run schema:check --workspace=apps/backend` against the clone. This is read-only and prints schema differences.
2. Generate a candidate change with `npm run migration:generate --workspace=apps/backend -- src/database/migrations/UpgradeExisting`. Review every statement, especially column drops and type changes, and preserve populated data. This candidate replaces the initial-create step for that database.
3. Apply the reviewed changes to the clone and verify the schema, row counts, authentication and existing business workflows.
4. Only after the clone exactly matches the entity schema may the initial baseline be recorded using TypeORM's `migration:run --fake` on a release containing only the baseline migration. Do not fake unrelated migrations. Retain the reviewed upgrade SQL and backup evidence in the release record.
5. Schedule the controlled production release and repeat the proven upgrade/baseline process.

The initial migration's down operation removes the new schema and its data. Use it only on an empty/disposable database. For populated deployments, prefer compatible forward fixes or restoring a verified backup. Preview deployments must use a distinct preview database and `DATABASE_ENV=preview`; this flag does not itself prove the URL is isolated.

The CLI loads the backend environment for source execution, or the current working directory environment for compiled execution. In CI/production, inject environment variables directly. No production database was changed during local verification.
