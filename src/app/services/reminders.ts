import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type ReminderType = "payment" | "renewal" | "trial_end";

export interface UserReminder {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  type: ReminderType;
  date: Date;
  daysBeforeReminder: number;
  enabled: boolean;
  icon: string;
  color: string;
}

interface CreateReminderInput {
  subscriptionId: string;
  subscriptionName: string;
  type: ReminderType;
  date: Date;
  daysBeforeReminder: number;
  enabled?: boolean;
  icon?: string;
  color?: string;
}

interface UpdateReminderInput extends Partial<CreateReminderInput> {}

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

function mapDocToReminder(id: string, data: Record<string, unknown>): UserReminder {
  return {
    id,
    subscriptionId: (data.subscriptionId as string) || "",
    subscriptionName: (data.subscriptionName as string) || "Suscripción",
    type: (data.type as ReminderType) || "payment",
    date: toDateValue(data.date),
    daysBeforeReminder: Number(data.daysBeforeReminder || 3),
    enabled: Boolean(data.enabled ?? true),
    icon: (data.icon as string) || "S",
    color: (data.color as string) || "bg-emerald-500",
  };
}

export function subscribeToUserReminders(
  uid: string,
  onData: (reminders: UserReminder[]) => void,
  onError: (error: Error) => void,
) {
  const ref = collection(db, "users", uid, "reminders");
  const q = query(ref, orderBy("date", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const reminders = snapshot.docs
        .filter((entry) => entry.id !== "_meta")
        .map((entry) => mapDocToReminder(entry.id, entry.data() as Record<string, unknown>));

      onData(reminders);
    },
    (error) => onError(error),
  );
}

export async function createUserReminder(uid: string, input: CreateReminderInput) {
  const ref = collection(db, "users", uid, "reminders");
  await addDoc(ref, {
    ...input,
    enabled: input.enabled ?? true,
    icon: input.icon || input.subscriptionName.charAt(0).toUpperCase() || "S",
    color: input.color || "bg-emerald-500",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserReminder(
  uid: string,
  reminderId: string,
  input: UpdateReminderInput,
) {
  const ref = doc(db, "users", uid, "reminders", reminderId);
  const payload: Record<string, unknown> = {
    ...input,
    updatedAt: serverTimestamp(),
  };

  if (typeof input.daysBeforeReminder !== "undefined") {
    payload.daysBeforeReminder = Number(input.daysBeforeReminder || 0);
  }

  await updateDoc(ref, payload);
}

export async function deleteUserReminder(uid: string, reminderId: string) {
  const ref = doc(db, "users", uid, "reminders", reminderId);
  await deleteDoc(ref);
}
