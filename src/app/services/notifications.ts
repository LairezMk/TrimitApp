import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type UserNotificationType = "success" | "warning" | "info" | "payment";

export interface UserNotification {
  id: string;
  type: UserNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  fingerprint?: string;
  relatedSubscriptionId?: string;
  relatedPaymentId?: string;
}

interface CreateUserNotificationInput {
  type: UserNotificationType;
  title: string;
  message: string;
  fingerprint?: string;
  relatedSubscriptionId?: string;
  relatedPaymentId?: string;
}

interface UpdateUserNotificationInput {
  read?: boolean;
  title?: string;
  message?: string;
  type?: UserNotificationType;
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

function mapDocToNotification(
  id: string,
  data: Record<string, unknown>,
): UserNotification {
  return {
    id,
    type: (data.type as UserNotificationType) || "info",
    title: (data.title as string) || "Notificación",
    message: (data.message as string) || "",
    read: Boolean(data.read ?? false),
    createdAt: toDateValue(data.createdAt),
    fingerprint: (data.fingerprint as string) || "",
    relatedSubscriptionId: (data.relatedSubscriptionId as string) || "",
    relatedPaymentId: (data.relatedPaymentId as string) || "",
  };
}

export function subscribeToUserNotifications(
  uid: string,
  onData: (notifications: UserNotification[]) => void,
  onError: (error: Error) => void,
) {
  const ref = collection(db, "users", uid, "notifications");
  const q = query(ref, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs
        .filter((entry) => entry.id !== "_meta")
        .map((entry) =>
          mapDocToNotification(entry.id, entry.data() as Record<string, unknown>),
        );

      onData(notifications);
    },
    (error) => onError(error),
  );
}

export async function createUserNotification(
  uid: string,
  input: CreateUserNotificationInput,
) {
  const ref = collection(db, "users", uid, "notifications");
  await addDoc(ref, {
    ...input,
    read: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserNotification(
  uid: string,
  notificationId: string,
  input: UpdateUserNotificationInput,
) {
  const ref = doc(db, "users", uid, "notifications", notificationId);
  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function markAllNotificationsAsRead(uid: string) {
  const ref = collection(db, "users", uid, "notifications");
  const pending = query(ref, where("read", "==", false));
  const snapshot = await getDocs(pending);

  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs
    .filter((entry) => entry.id !== "_meta")
    .forEach((entry) => {
      batch.update(entry.ref, {
        read: true,
        updatedAt: serverTimestamp(),
      });
    });

  await batch.commit();
}

export async function deleteUserNotification(uid: string, notificationId: string) {
  const ref = doc(db, "users", uid, "notifications", notificationId);
  await deleteDoc(ref);
}

export async function deleteReadNotifications(uid: string) {
  const ref = collection(db, "users", uid, "notifications");
  const readQuery = query(ref, where("read", "==", true));
  const snapshot = await getDocs(readQuery);

  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs
    .filter((entry) => entry.id !== "_meta")
    .forEach((entry) => batch.delete(entry.ref));
  await batch.commit();
}

export async function clearAllNotifications(uid: string) {
  const ref = collection(db, "users", uid, "notifications");
  const snapshot = await getDocs(ref);

  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs
    .filter((entry) => entry.id !== "_meta")
    .forEach((entry) => batch.delete(entry.ref));
  await batch.commit();
}
