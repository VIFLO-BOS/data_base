-- Seed default permissions
INSERT INTO permissions (resource, action, description) VALUES
  ('users', 'read', 'View users'),
  ('users', 'create', 'Create users'),
  ('users', 'update', 'Update users'),
  ('users', 'delete', 'Delete users'),
  ('projects', 'read', 'View projects'),
  ('projects', 'create', 'Create projects'),
  ('projects', 'update', 'Update projects'),
  ('projects', 'delete', 'Delete projects'),
  ('taskers', 'read', 'View taskers'),
  ('taskers', 'create', 'Create taskers'),
  ('taskers', 'update', 'Update taskers'),
  ('taskers', 'delete', 'Delete taskers'),
  ('timesheets', 'read', 'View timesheets'),
  ('timesheets', 'create', 'Create timesheets'),
  ('timesheets', 'update', 'Update timesheets'),
  ('timesheets', 'approve', 'Approve timesheets'),
  ('reports', 'read', 'View reports'),
  ('reports', 'export', 'Export reports'),
  ('audit_logs', 'read', 'View audit logs')
ON CONFLICT (resource, action) DO NOTHING;
