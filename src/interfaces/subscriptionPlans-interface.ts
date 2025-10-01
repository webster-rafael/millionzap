export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: string[];
  status:
    | "ACTIVE"
    | "INACTIVE"
    | "PENDING"
    | "EXPIRED"
    | "CANCELLED"
    | "TESTING";
  checkoutUrl: string;
  createdAt: string;
  updatedAt: string;
}
