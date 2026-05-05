import { create } from 'zustand';

interface Tasker {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountName: string;
  bank: string;
  accountNumber: string;
  status: 'Assigned' | 'Unassigned' | 'Archived';
  projects: string[];
}

interface Account {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  projects: string[];
}

interface TimesheetRow {
  id: string;
  tasker: string;
  account: string;
  days: string[];
  totalHours: string;
  totalAmount: string;
}

interface Project {
  id: string;
  name: string;
  websiteLink: string;
  hourlyFee: string;
  accountsCount: number;
  taskersCount: number;
  dateCreated: string;
}

interface DashboardState {
  taskers: Tasker[];
  accounts: Account[];
  timesheets: TimesheetRow[];
  projects: Project[];

  addTasker: (tasker: Omit<Tasker, 'id'>) => void;
  updateTasker: (id: string, updates: Partial<Tasker>) => void;
  deleteTasker: (id: string) => void;

  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;

  updateTimesheet: (id: string, dayIndex: number, time: string) => void;

  addProject: (project: Omit<Project, 'id'>) => void;
}

const mockTaskers: Tasker[] = [
  { id: '1', name: 'Sarah Doe', email: 'sarah@example.com', phone: '1234567890', accountName: 'Sarah Doe', bank: 'Glass Bank', accountNumber: '00987654321', status: 'Assigned', projects: ['MAGS', 'BLAZE', 'INFERNO', 'FLAME'] },
  { id: '2', name: 'Bill Doe', email: 'bill@example.com', phone: '0987654321', accountName: 'Bill Doe', bank: 'Glass Bank', accountNumber: '12345678900', status: 'Assigned', projects: ['MAGS', 'BLAZE', 'BENERT', 'FLAME'] },
];

const mockAccounts: Account[] = [
  { id: '1', name: 'MAGS', status: 'Active', projects: ['Ventree'] },
  { id: '2', name: 'BLAZE', status: 'Active', projects: ['Ventree'] },
  { id: '3', name: 'BENERT', status: 'Active', projects: ['Ventree'] },
];

const mockTimesheets: TimesheetRow[] = [
  { id: '1', tasker: 'Sarah Doe', account: 'MAGS & BLAZE', days: ['8h:00m', '--:--', '--:--', '--:--', '--:--', '--:--', '--:--'], totalHours: '8h:00m', totalAmount: '$2,240' },
  { id: '2', tasker: 'Bill Doe', account: 'MAGS', days: Array(7).fill('--:--'), totalHours: '--:--', totalAmount: '$0' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'Ventree', websiteLink: 'ventree.com', hourlyFee: '$20', accountsCount: 3, taskersCount: 12, dateCreated: 'Mon, April 22 2025' }
];

export const useDashboardStore = create<DashboardState>((set) => ({
  taskers: mockTaskers,
  accounts: mockAccounts,
  timesheets: mockTimesheets,
  projects: mockProjects,

  addTasker: (tasker) => set((state) => ({
    taskers: [...state.taskers, { ...tasker, id: Math.random().toString(36).substr(2, 9) }]
  })),

  updateTasker: (id, updates) => set((state) => ({
    taskers: state.taskers.map((t) => (t.id === id ? { ...t, ...updates } : t))
  })),

  deleteTasker: (id) => set((state) => ({
    taskers: state.taskers.filter((t) => t.id !== id)
  })),

  addAccount: (account) => set((state) => ({
    accounts: [...state.accounts, { ...account, id: Math.random().toString(36).substr(2, 9) }]
  })),

  updateAccount: (id, updates) => set((state) => ({
    accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a))
  })),

  updateTimesheet: (id, dayIndex, time) => set((state) => ({
    timesheets: state.timesheets.map((ts) => {
      if (ts.id === id) {
        const newDays = [...ts.days];
        newDays[dayIndex] = time;
        return { ...ts, days: newDays };
      }
      return ts;
    })
  })),

  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Math.random().toString(36).substr(2, 9) }]
  })),
}));
