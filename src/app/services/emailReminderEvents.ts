import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { dateFromInputValue } from "../utils/date";

export type EmailReminderEventState = "queued" | "sent" | "failed" | "retried";

export interface EmailReminderEvent {
  id: string;
  eventId: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  to: string;
  reminderDays: number;
  state: EmailReminderEventState;
  attempts: number;
  scheduledFor: Date;
  createdAt: Date;
  sentAt?: Date;
  failedAt?: Date;
  retriedAt?: Date;
  lastError?: string;
}

function toDateValue(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return dateFromInputValue(value);
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

function mapDocToEvent(id: string, data: Record<string, unknown>): EmailReminderEvent {
  return {
    id,
    eventId: (data.eventId as string) || id,
    subscriptionId: (data.subscriptionId as string) || "",
    subscriptionName: (data.subscriptionName as string) || "Suscripción",
    amount: Number(data.amount || 0),
    currency: (data.currency as string) || "COP",
    to: (data.to as string) || "",
    reminderDays: Number(data.reminderDays || 3),
    state: (data.state as EmailReminderEventState) || "queued",
    attempts: Number(data.attempts || 1),
    scheduledFor: toDateValue(data.scheduledFor),
    createdAt: toDateValue(data.createdAt),
    sentAt: data.sentAt ? toDateValue(data.sentAt) : undefined,
    failedAt: data.failedAt ? toDateValue(data.failedAt) : undefined,
    retriedAt: data.retriedAt ? toDateValue(data.retriedAt) : undefined,
    lastError: (data.lastError as string) || "",
  };
}

export function subscribeToUserEmailReminderEvents(
  uid: string,
  onData: (events: EmailReminderEvent[]) => void,
  onError: (error: Error) => void,
) {
  const ref = collection(db, "users", uid, "emailReminderEvents");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const events = snapshot.docs
        .filter((entry) => entry.id !== "_meta")
        .map((entry) => mapDocToEvent(entry.id, entry.data() as Record<string, unknown>));
      onData(events);
    },
    (error) => onError(error),
  );
}

export async function deleteUserEmailReminderEvent(uid: string, eventId: string) {
  const ref = doc(db, "users", uid, "emailReminderEvents", eventId);
  await deleteDoc(ref);
}

export async function createUserEmailReminderEvent(
  uid: string,
  input: {
    eventId: string;
    subscriptionId: string;
    subscriptionName: string;
    amount: number;
    currency: string;
    to: string;
    reminderDays: number;
    scheduledFor: Date;
    provider: string;
  },
) {
  const ref = doc(db, "users", uid, "emailReminderEvents", input.eventId);
  await setDoc(ref, {
    uid,
    ...input,
    state: "sent",
    attempts: 1,
    reminderMode: "manual",
    createdAt: serverTimestamp(),
    lastAttemptAt: serverTimestamp(),
    sentAt: serverTimestamp(),
  });
}

export async function clearUserEmailReminderEventsByState(
  uid: string,
  states: EmailReminderEventState[],
) {
  const ref = collection(db, "users", uid, "emailReminderEvents");
  const batch = writeBatch(db);

  for (const state of states) {
    const stateSnapshot = await getDocs(query(ref, where("state", "==", state)));
    stateSnapshot.docs
      .filter((entry) => entry.id !== "_meta")
      .forEach((entry) => batch.delete(entry.ref));
  }

  await batch.commit();
}
