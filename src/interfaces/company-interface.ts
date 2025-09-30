export interface Company {
  id: string;
  name: string;
  phone: string;
  email: string;
  subscriptions: CompanySubscription[];
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
}

export interface CompanySubscription {
  id: string;
  companyId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED" | "TESTING";
  paymentStatus: "PENDING" | "PAID" | "OVERDUE" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
  plan: SubscriptionPlan;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  features: string[];
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}
