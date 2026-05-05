-- Seed default roles
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  ('admin', 'Administrative access'),
  ('client', 'Client account access'),
  ('tasker', 'Tasker/Annotator access')
ON CONFLICT (name) DO NOTHING;
