import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";

interface BootstrapUserWorkspaceParams {
  uid: string;
  email: string | null;
  displayName: string;
}

const DEFAULT_CATEGORIES = [
  { id: "general", name: "General", color: "#10B981", icon: "tag" },
  { id: "entertainment", name: "Entretenimiento", color: "#EF4444", icon: "play" },
  { id: "music", name: "Música", color: "#10B981", icon: "music" },
  { id: "productivity", name: "Productividad", color: "#2563EB", icon: "briefcase" },
  { id: "phone", name: "Telefonía", color: "#06B6D4", icon: "phone" },
  { id: "internet", name: "Internet", color: "#3B82F6", icon: "wifi" },
  { id: "education", name: "Educación", color: "#A855F7", icon: "graduation-cap" },
  { id: "health", name: "Salud", color: "#EC4899", icon: "heart" },
  { id: "finance", name: "Finanzas", color: "#22C55E", icon: "wallet" },
  { id: "shopping", name: "Compras", color: "#F97316", icon: "shopping-bag" },
  { id: "transport", name: "Transporte", color: "#6366F1", icon: "car" },
  { id: "security", name: "Seguridad", color: "#374151", icon: "shield" },
];

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

  DEFAULT_CATEGORIES.forEach((category) => {
    batch.set(
      doc(db, "users", uid, "categories", category.id),
      {
        name: category.name,
        color: category.color,
        icon: category.icon,
        budget: 0,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  });

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
