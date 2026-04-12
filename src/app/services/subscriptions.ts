import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Subscription } from "../types/subscription";

interface UpsertSubscriptionInput {
  name: string;
  category: string;
  amount: number;
  currency: string;
  status: Subscription["status"];
  isRecurring: boolean;
  nextPaymentDate: Date;
  icon: string;
  color: string;
  notes?: string;
  source?: Subscription["source"];
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

function mapDocToSubscription(id: string, data: Record<string, unknown>): Subscription {
  return {
    id,
    name: (data.name as string) || "Sin nombre",
    category: (data.category as string) || "Otros",
    amount: Number(data.amount || 0),
    currency: (data.currency as string) || "$",
    status: (data.status as Subscription["status"]) || "active",
    isRecurring: Boolean(data.isRecurring ?? true),
    nextPaymentDate: toDateValue(data.nextPaymentDate),
    icon: (data.icon as string) || "S",
    color: (data.color as string) || "bg-emerald-500",
    notes: (data.notes as string) || "",
    source: (data.source as Subscription["source"]) || "manual",
    rules: Array.isArray(data.rules) ? (data.rules as Subscription["rules"]) : [],
  };
}

export function subscribeToUserSubscriptions(
  uid: string,
  onData: (subscriptions: Subscription[]) => void,
  onError: (error: Error) => void,
) {
  const ref = collection(db, "users", uid, "subscriptions");
  const q = query(ref, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const subscriptions = snapshot.docs
        .filter((d) => d.id !== "_meta")
        .map((d) => mapDocToSubscription(d.id, d.data() as Record<string, unknown>));

      onData(subscriptions);
    },
    (error) => onError(error),
  );
}

export async function createUserSubscription(uid: string, input: UpsertSubscriptionInput) {
  const ref = collection(db, "users", uid, "subscriptions");

  await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserSubscription(
  uid: string,
  subscriptionId: string,
  input: UpsertSubscriptionInput,
) {
  const ref = doc(db, "users", uid, "subscriptions", subscriptionId);

  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserSubscription(uid: string, subscriptionId: string) {
  const ref = doc(db, "users", uid, "subscriptions", subscriptionId);
  await deleteDoc(ref);
}

export async function getUserSubscription(uid: string, subscriptionId: string) {
  const ref = doc(db, "users", uid, "subscriptions", subscriptionId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return mapDocToSubscription(snapshot.id, snapshot.data() as Record<string, unknown>);
}
