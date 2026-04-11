export type UserRole = "user" | "admin";
export type UserStatus = "active" | "blocked" | "deleted";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  currency: "COP" | "USD" | "EUR";
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export type SubscriptionStatus = "active" | "paused" | "cancelled" | "trial" | "archived";
export type BillingCycle = "monthly" | "yearly" | "weekly" | "custom";

export interface SubscriptionDocument {
  id: string;
  name: string;
  categoryId: string | null;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  billingInterval: number;
  startDate: Date;
  nextPaymentDate: Date;
  paymentMethodId: string | null;
  status: SubscriptionStatus;
  isAutoRenew: boolean;
  provider: string | null;
  icon: string | null;
  color: string | null;
  notes: string | null;
  tags: string[];
  cancelUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export type PaymentStatus = "paid" | "failed" | "refunded" | "pending";
export type PaymentSource = "manual" | "projected" | "imported";

export interface PaymentDocument {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  periodStart: Date | null;
  periodEnd: Date | null;
  status: PaymentStatus;
  source: PaymentSource;
  createdAt: Date;
}

export type ReminderType = "before_charge" | "budget_limit" | "renewal" | "custom";

export interface ReminderDocument {
  id: string;
  subscriptionId: string;
  type: ReminderType;
  daysBefore: number;
  enabled: boolean;
  channel: "in_app" | "email";
  nextTriggerAt: Date;
  lastTriggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
