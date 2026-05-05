# Database Design

## Entities
- `users` - Core user accounts
- `profiles` - Extended user profiles
- `roles` - Role definitions
- `permissions` - Permission definitions
- `user_roles` - Many-to-many user-role mapping
- `role_permissions` - Many-to-many role-permission mapping
- `admins` - Admin-specific data
- `clients` - Client-specific data
- `taskers` - Tasker/annotator-specific data
- `projects` - Project definitions
- `project_taskers` - Project-tasker assignments
- `accounts` - Account/organization data
- `timesheets` - Weekly timesheet records
- `timesheet_entries` - Daily timesheet line items
- `notifications` - User notifications
- `audit_logs` - System audit trail
- `reports` - Generated reports
- `export_jobs` - Async export jobs
- `sessions` - Active JWT sessions
- `oauth_accounts` - OAuth provider links

## Migration Workflow
1. Update entity in `apps/backend/src/modules/*/entities/`
2. Generate migration: `npm run migration:generate`
3. Review migration SQL in `database/migrations/versions/`
4. Apply migration: `npm run migration:run`
5. Seed data: `npm run seed`
