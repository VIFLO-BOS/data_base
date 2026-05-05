-- Table: timesheets
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasker_id UUID REFERENCES taskers(id),
  project_id UUID REFERENCES projects(id),
  week_starting DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_hours DECIMAL(5,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: timesheet_entries
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timesheet_id UUID REFERENCES timesheets(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  hours_worked DECIMAL(4,2) NOT NULL,
  task_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
