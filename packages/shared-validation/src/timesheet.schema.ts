import { z } from 'zod';

export const timesheetEntrySchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hoursWorked: z.number().min(0).max(24),
  taskDescription: z.string().optional(),
});

export const createTimesheetSchema = z.object({
  taskerId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  weekStarting: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), 
  entries: z.array(timesheetEntrySchema).min(1),
});

export const approveTimesheetSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
});

export type CreateTimesheetInput = z.infer<typeof createTimesheetSchema>;
export type ApproveTimesheetInput = z.infer<typeof approveTimesheetSchema>;
