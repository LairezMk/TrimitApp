import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
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

export interface CreateSubscriptionResult {
  created: boolean;
  id?: string;
  duplicate?: Subscription;
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

export function normalizeSubscriptionIdentity(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(inc|llc|ltda|sas|s\.a\.s|s\.a|colombia|latam)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isDuplicateSubscription(
  existing: Subscription,
  input: UpsertSubscriptionInput,
) {
  const existingKey = normalizeSubscriptionIdentity(existing.name);
  const inputKey = normalizeSubscriptionIdentity(input.name);
  if (!existingKey || !inputKey) {
    return false;
  }

  if (existingKey === inputKey) {
    return true;
  }

  const namesAreVerySimilar =
    existingKey.includes(inputKey) || inputKey.includes(existingKey);
  const amountsAreClose =
    Number(existing.amount || 0) > 0 &&
    Number(input.amount || 0) > 0 &&
    Math.abs(Number(existing.amount) - Number(input.amount)) <=
      Math.max(1000, Number(input.amount) * 0.03);

  return namesAreVerySimilar && amountsAreClose;
}

export async function createUserSubscriptionIfNotExists(
  uid: string,
  input: UpsertSubscriptionInput,
): Promise<CreateSubscriptionResult> {
  const ref = collection(db, "users", uid, "subscriptions");
  const snapshot = await getDocs(ref);
  const existing = snapshot.docs
    .filter((d) => d.id !== "_meta")
    .map((d) => mapDocToSubscription(d.id, d.data() as Record<string, unknown>));
  const duplicate = existing.find((subscription) =>
    isDuplicateSubscription(subscription, input),
  );

  if (duplicate) {
    return { created: false, duplicate };
  }

  const created = await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { created: true, id: created.id };
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
