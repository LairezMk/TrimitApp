import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";

interface BootstrapUserWorkspaceParams {
  uid: string;
  email: string | null;
  displayName: string;
}

export async function bootstrapUserWorkspace({ uid, email, displayName }: BootstrapUserWorkspaceParams) {
  const batch = writeBatch(db);
  const now = serverTimestamp();

  const userRef = doc(db, "users", uid);
  batch.set(
    userRef,
    {
      uid,
      email,
      displayName,
      role: "user",
      status: "active",
      currency: "COP",
      timezone: "America/Bogota",
      preferences: {
        emailEnabled: true,
        paymentReminderEmail5d: false,
        paymentReminderEmailUnsubscribed: false,
        reminderDays: 3,
      },
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    },
    { merge: true },
  );

  batch.set(
    doc(db, "users", uid, "subscriptions", "_meta"),
    { initialized: true, createdAt: now },
    { merge: true },
  );

  batch.set(
    doc(db, "users", uid, "payments", "_meta"),
    { initialized: true, createdAt: now },
    { merge: true },
  );

  batch.set(
    doc(db, "users", uid, "reminders", "_meta"),
    { initialized: true, createdAt: now },
    { merge: true },
  );

  batch.set(
    doc(db, "users", uid, "categories", "default"),
    {
      name: "General",
      color: "#10B981",
      icon: "tag",
      isDefault: true,
      createdAt: now,
    },
    { merge: true },
  );

  batch.set(
    doc(db, "users", uid, "budgets", "_meta"),
    {
      scope: "global",
      limitAmount: 0,
      currency: "COP",
      month: new Date().toISOString().slice(0, 7),
      alertPercent: 80,
      createdAt: now,
      updatedAt: now,
      initialized: true,
    },
    { merge: true },
  );

  batch.set(
    doc(db, "users", uid, "notifications", "_meta"),
    { initialized: true, createdAt: now, read: true },
    { merge: true },
  );

  batch.set(
    doc(db, "users", uid, "recommendations", "_meta"),
    { initialized: true, createdAt: now, status: "new" },
    { merge: true },
  );

  await batch.commit();
}
