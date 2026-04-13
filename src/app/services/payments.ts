import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type UserPaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type UserPaymentSource = "manual" | "projected" | "imported";

export interface UserPayment {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  category: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  status: UserPaymentStatus;
  source: UserPaymentSource;
  notes?: string;
}

interface CreatePaymentInput {
  subscriptionId: string;
  subscriptionName: string;
  category: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  status?: UserPaymentStatus;
  source?: UserPaymentSource;
  notes?: string;
}

function toDateValue(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

function mapDocToPayment(id: string, data: Record<string, unknown>): UserPayment {
  return {
    id,
    subscriptionId: (data.subscriptionId as string) || "",
    subscriptionName: (data.subscriptionName as string) || "Suscripción",
    category: (data.category as string) || "General",
    amount: Number(data.amount || 0),
    currency: (data.currency as string) || "COP",
    paymentDate: toDateValue(data.paymentDate),
    status: (data.status as UserPaymentStatus) || "paid",
    source: (data.source as UserPaymentSource) || "manual",
    notes: (data.notes as string) || "",
  };
}

export function subscribeToUserPayments(
  uid: string,
  onData: (payments: UserPayment[]) => void,
  onError: (error: Error) => void,
) {
  const ref = collection(db, "users", uid, "payments");
  const q = query(ref, orderBy("paymentDate", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const payments = snapshot.docs
        .filter((d) => d.id !== "_meta")
        .map((d) => mapDocToPayment(d.id, d.data() as Record<string, unknown>));

      onData(payments);
    },
    (error) => onError(error),
  );
}

export async function createUserPayment(uid: string, input: CreatePaymentInput) {
  const ref = collection(db, "users", uid, "payments");
  await addDoc(ref, {
    ...input,
    status: input.status || "paid",
    source: input.source || "manual",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
