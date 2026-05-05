export interface User {
  id: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  timezone: string;
}

export type Role = 'super_admin' | 'admin' | 'client' | 'tasker';
