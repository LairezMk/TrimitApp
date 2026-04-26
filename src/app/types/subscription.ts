export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  status: "active" | "suspended" | "forgotten";
  isRecurring: boolean;
  nextPaymentDate: Date;
  icon: string;
  color: string;
  notes?: string;
  source?: "manual" | "gmail-detected" | "bank-statement";
  rules?: SubscriptionRule[];
}

export interface SubscriptionRule {
  id: string;
  type: "alert" | "cancel" | "notify";
  condition: string;
  value: string;
}
