export interface Company {
  id: string;
  name: string;
  phone: string;
  email: string;
  planId: string;
  status: boolean;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompany {
  name: string;
  phone: string;
  email: string;
  password: string;
  planId: string;
}
