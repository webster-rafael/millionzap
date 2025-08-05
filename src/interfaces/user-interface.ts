export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  companyId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: string;
}
