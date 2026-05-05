export interface Tasker {
  id: string;
  userId: string;
  skills: string[];
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  hourlyRate?: number;
  rating: number;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
