import { z } from 'zod';

export const createTaskerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  bio: z.string().optional(),
});

export const updateTaskerSchema = createTaskerSchema.partial();

export type CreateTaskerInput = z.infer<typeof createTaskerSchema>;
export type UpdateTaskerInput = z.infer<typeof updateTaskerSchema>;
