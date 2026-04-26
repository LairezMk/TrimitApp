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

export interface SharedSubscriptionGroup {
  id: string;
  subscriptionId: string;
  memberNames: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UpsertSharedGroupInput {
  subscriptionId: string;
  memberNames: string[];
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

function mapDocToSharedGroup(
  id: string,
  data: Record<string, unknown>,
): SharedSubscriptionGroup {
  return {
    id,
    subscriptionId: (data.subscriptionId as string) || "",
    memberNames: Array.isArray(data.memberNames)
      ? (data.memberNames as string[]).filter(Boolean)
      : [],
    notes: (data.notes as string) || "",
    createdAt: toDateValue(data.createdAt),
    updatedAt: toDateValue(data.updatedAt),
  };
}

export function subscribeToSharedGroups(
  uid: string,
  onData: (groups: SharedSubscriptionGroup[]) => void,
  onError: (error: Error) => void,
) {
  const ref = collection(db, "users", uid, "sharing");
  const q = query(ref, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const groups = snapshot.docs
        .filter((d) => d.id !== "_meta")
        .map((d) => mapDocToSharedGroup(d.id, d.data() as Record<string, unknown>));
      onData(groups);
    },
    (error) => onError(error),
  );
}

export async function createSharedGroup(uid: string, input: UpsertSharedGroupInput) {
  const ref = collection(db, "users", uid, "sharing");
  await addDoc(ref, {
    subscriptionId: input.subscriptionId,
    memberNames: input.memberNames,
    notes: input.notes || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateSharedGroup(
  uid: string,
  groupId: string,
  input: UpsertSharedGroupInput,
) {
  const ref = doc(db, "users", uid, "sharing", groupId);
  await updateDoc(ref, {
    subscriptionId: input.subscriptionId,
    memberNames: input.memberNames,
    notes: input.notes || "",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSharedGroup(uid: string, groupId: string) {
  const ref = doc(db, "users", uid, "sharing", groupId);
  await deleteDoc(ref);
}
