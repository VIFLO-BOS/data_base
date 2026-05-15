# B-02: Run SQL Schemas & Verify Tables in Supabase

> **Goal:** Create all database tables in Supabase using your existing SQL schema files.  
> **Time Estimate:** 45 minutes  
> **Prerequisites:** [B-01 — Supabase Project Setup](./01-supabase-project-setup.md)

---

## What You'll Learn

- How the Supabase SQL Editor works
- What each table does and how they relate
- How to seed initial roles, permissions, and mappings

---

## Step 1: Enable UUID Extension

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## Step 2: Run Schema Files (In Order)

> [!IMPORTANT]
> **Order matters!** Tables reference each other. Run them in this exact order.

Open each file from `database/schemas/` in your code editor, copy the contents, paste into the Supabase SQL Editor, and click **Run**.

| Order | File | Tables Created |
|-------|------|---------------|
| 1 | `users.schema.sql` | `users`, `profiles` |
| 2 | `roles.schema.sql` | `roles`, `permissions`, `user_roles`, `role_permissions` |
| 3 | `entities.schema.sql` | `admins`, `clients`, `taskers` |
| 4 | `projects.schema.sql` | `projects`, `project_taskers`, `accounts` |
| 5 | `timesheets.schema.sql` | `timesheets`, `timesheet_entries` |
| 6 | `system.schema.sql` | `notifications`, `audit_logs`, `reports`, `export_jobs`, `sessions`, `oauth_accounts` + indexes |

After each one you should see: **"Success. No rows returned."**

---

## Step 3: Verify All Tables

Run this query to confirm all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see **18+ tables** listed.

---

## Step 4: Seed Default Roles

```sql
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full system access. Can manage other admins.'),
  ('admin', 'Manage projects, taskers, accounts, timesheets, reports.'),
  ('client', 'View own projects, reports, and billing.'),
  ('tasker', 'View assigned tasks, submit timesheets.')
ON CONFLICT (name) DO NOTHING;
```

Verify: `SELECT * FROM roles;` — you should see 4 rows.

---

## Step 5: Seed Default Permissions

```sql
INSERT INTO permissions (resource, action, description) VALUES
  ('users', 'read', 'View user accounts'),
  ('users', 'create', 'Create new user accounts'),
  ('users', 'update', 'Update user account details'),
  ('users', 'delete', 'Delete user accounts'),
  ('projects', 'read', 'View projects'),
  ('projects', 'create', 'Create new projects'),
  ('projects', 'update', 'Update project details'),
  ('projects', 'delete', 'Delete projects'),
  ('taskers', 'read', 'View tasker profiles'),
  ('taskers', 'create', 'Create new tasker profiles'),
  ('taskers', 'update', 'Update tasker profiles'),
  ('taskers', 'delete', 'Delete tasker profiles'),
  ('timesheets', 'read', 'View timesheets'),
  ('timesheets', 'create', 'Submit timesheets'),
  ('timesheets', 'update', 'Edit timesheets'),
  ('timesheets', 'approve', 'Approve or reject timesheets'),
  ('reports', 'read', 'View reports'),
  ('reports', 'export', 'Export reports to PDF/CSV'),
  ('audit_logs', 'read', 'View audit log entries')
ON CONFLICT (resource, action) DO NOTHING;
```

---

## Step 6: Assign Permissions to Roles

```sql
-- Admin + Super Admin get ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name IN ('admin', 'super_admin')
ON CONFLICT DO NOTHING;

-- Client gets read-only on projects, reports, timesheets
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'client' AND (
  (p.resource = 'projects' AND p.action = 'read') OR
  (p.resource = 'reports' AND p.action = 'read') OR
  (p.resource = 'timesheets' AND p.action = 'read')
) ON CONFLICT DO NOTHING;

-- Tasker gets limited permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'tasker' AND (
  (p.resource = 'projects' AND p.action = 'read') OR
  (p.resource = 'timesheets' AND p.action IN ('read', 'create', 'update'))
) ON CONFLICT DO NOTHING;
```

Verify with:

```sql
SELECT r.name AS role, p.resource, p.action
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
ORDER BY r.name, p.resource, p.action;
```

---

## Step 7: Create `updated_at` Trigger

PostgreSQL doesn't auto-update `updated_at`. Create a trigger:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

Then apply it to all tables that have `updated_at`:

```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taskers_updated_at BEFORE UPDATE ON taskers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheet_entries_updated_at BEFORE UPDATE ON timesheet_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ Checklist

- [ ] UUID extension enabled
- [ ] All 6 schema files run (in order)
- [ ] 18+ tables visible in Supabase Table Editor
- [ ] 4 default roles seeded
- [ ] 19 default permissions seeded
- [ ] Role-permission mappings seeded
- [ ] `updated_at` trigger created

---

## What's Next?

→ [**B-03:** Configure NestJS — Database, CORS, Swagger, Guards](./03-nestjs-foundation.md)
