export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  queues?: UserQueue[];
  connectionId?: string | null;
  tokenIg?: string | null;
  instagramId?: string | null;
  instagramAuthenticated?: boolean | null;
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
  phone: string;
  password: string;
  role: string;
  queueIds?: string[];
  companyId: string;
  connectionId?: string | null;
}
