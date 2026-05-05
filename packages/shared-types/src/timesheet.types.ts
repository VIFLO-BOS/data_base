export interface Timesheet {
  id: string;
  taskerId: string;
  projectId?: string;
  weekStarting: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  totalHours: number;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  entries: TimesheetEntry[];
}

export interface TimesheetEntry {
  id: string;
  entryDate: string;
  hoursWorked: number;
  taskDescription?: string;
}
