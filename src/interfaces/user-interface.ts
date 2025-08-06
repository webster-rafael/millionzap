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
  queues?: UserQueue[];
}

interface UserQueue {
  queue: {
    id: string;
    name: string;
    color: string;
  };
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: string;
  queueIds?: string[];
}
