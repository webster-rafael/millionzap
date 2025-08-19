export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  queues?: UserQueue[];
  connectionId?: string | null;
}

interface UserQueue {
  queue: {
    id: string;
    name: string;
    color: string;
    companyId: string;
  };
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: string;
  queueIds?: string[];
  companyId: string;
  connectionId?: string | null;
}
