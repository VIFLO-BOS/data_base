export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  clientId?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
