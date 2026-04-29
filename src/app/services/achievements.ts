import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type AchievementIconKey =
  | "star"
  | "target"
  | "calendar"
  | "dollar"
  | "chart"
  | "bell"
  | "users"
  | "archive"
  | "sparkles"
  | "shield";

export type AchievementId =
  | "first-subscription"
  | "subscriptions-5"
  | "payments-1"
  | "payments-15"
  | "reminders-3"
  | "shared-1"
  | "shared-3"
  | "archived-3"
  | "detected-1"
  | "categories-6";

export interface AchievementMetrics {
  subscriptionsTotal: number;
  paymentsTotal: number;
  remindersEnabledTotal: number;
  sharedGroupsTotal: number;
  archivedSubscriptionsTotal: number;
  detectedSubscriptionsTotal: number;
  categoriesTotal: number;
}

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  icon: AchievementIconKey;
  rarity: "common" | "rare" | "epic";
  target: number;
  getCurrentValue: (metrics: AchievementMetrics) => number;
}

export interface UserAchievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: AchievementIconKey;
  rarity: "common" | "rare" | "epic";
  target: number;
  unlockedAt: Date;
  statsSnapshot: AchievementMetrics;
}

function toDateValue(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

const metricGetters = {
  subscriptionsTotal: (m: AchievementMetrics) => m.subscriptionsTotal,
  paymentsTotal: (m: AchievementMetrics) => m.paymentsTotal,
  remindersEnabledTotal: (m: AchievementMetrics) => m.remindersEnabledTotal,
  sharedGroupsTotal: (m: AchievementMetrics) => m.sharedGroupsTotal,
  archivedSubscriptionsTotal: (m: AchievementMetrics) => m.archivedSubscriptionsTotal,
  detectedSubscriptionsTotal: (m: AchievementMetrics) => m.detectedSubscriptionsTotal,
  categoriesTotal: (m: AchievementMetrics) => m.categoriesTotal,
} as const;

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-subscription",
    title: "Primer paso",
    description: "Crea tu primera suscripción en Trimit.",
    icon: "star",
    rarity: "common",
    target: 1,
    getCurrentValue: metricGetters.subscriptionsTotal,
  },
  {
    id: "subscriptions-5",
    title: "Coleccionista",
    description: "Administra 5 suscripciones en tu cuenta.",
    icon: "target",
    rarity: "rare",
    target: 5,
    getCurrentValue: metricGetters.subscriptionsTotal,
  },
  {
    id: "payments-1",
    title: "Pago registrado",
    description: "Registra tu primer pago manual o importado.",
    icon: "dollar",
    rarity: "common",
    target: 1,
    getCurrentValue: metricGetters.paymentsTotal,
  },
  {
    id: "payments-15",
    title: "Historial sólido",
    description: "Acumula 15 pagos en tu historial.",
    icon: "chart",
    rarity: "epic",
    target: 15,
    getCurrentValue: metricGetters.paymentsTotal,
  },
  {
    id: "reminders-3",
    title: "Agenda al día",
    description: "Mantén 3 recordatorios activos.",
    icon: "bell",
    rarity: "rare",
    target: 3,
    getCurrentValue: metricGetters.remindersEnabledTotal,
  },
  {
    id: "shared-1",
    title: "Compartiendo gastos",
    description: "Crea tu primer grupo de suscripción compartida.",
    icon: "users",
    rarity: "common",
    target: 1,
    getCurrentValue: metricGetters.sharedGroupsTotal,
  },
  {
    id: "shared-3",
    title: "Capitán del ahorro",
    description: "Gestiona 3 grupos compartidos.",
    icon: "calendar",
    rarity: "epic",
    target: 3,
    getCurrentValue: metricGetters.sharedGroupsTotal,
  },
  {
    id: "archived-3",
    title: "Depuración inteligente",
    description: "Archiva o pausa 3 suscripciones que no uses.",
    icon: "archive",
    rarity: "rare",
    target: 3,
    getCurrentValue: metricGetters.archivedSubscriptionsTotal,
  },
  {
    id: "detected-1",
    title: "Detección automática",
    description: "Importa al menos una suscripción desde correo o extracto.",
    icon: "sparkles",
    rarity: "rare",
    target: 1,
    getCurrentValue: metricGetters.detectedSubscriptionsTotal,
  },
  {
    id: "categories-6",
    title: "Control total",
    description: "Organiza tus gastos en 6 categorías distintas.",
    icon: "shield",
    rarity: "epic",
    target: 6,
    getCurrentValue: metricGetters.categoriesTotal,
  },
];

export function getAchievementById(id: AchievementId) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id) || null;
}

export function getAchievementProgress(
  achievement: AchievementDefinition,
  metrics: AchievementMetrics,
) {
  const current = achievement.getCurrentValue(metrics);
  const progress = Math.min(100, Math.round((current / achievement.target) * 100));
  const completed = current >= achievement.target;
  return { current, progress, completed };
}

export function getUnlockableAchievementIds(metrics: AchievementMetrics): AchievementId[] {
  return ACHIEVEMENTS.filter((achievement) =>
    getAchievementProgress(achievement, metrics).completed,
  ).map((achievement) => achievement.id);
}

function mapDocToAchievement(id: string, data: Record<string, unknown>): UserAchievement | null {
  const definition = getAchievementById(id as AchievementId);
  if (!definition) return null;
  return {
    id: definition.id,
    title: definition.title,
    description: definition.description,
    icon: definition.icon,
    rarity: definition.rarity,
    target: definition.target,
    unlockedAt: toDateValue(data.unlockedAt),
    statsSnapshot: (data.statsSnapshot as AchievementMetrics) || {
      subscriptionsTotal: 0,
      paymentsTotal: 0,
      remindersEnabledTotal: 0,
      sharedGroupsTotal: 0,
      archivedSubscriptionsTotal: 0,
      detectedSubscriptionsTotal: 0,
      categoriesTotal: 0,
    },
  };
}

export function subscribeToUserAchievements(
  uid: string,
  onData: (achievements: UserAchievement[]) => void,
  onError: (error: Error) => void,
) {
  const ref = collection(db, "users", uid, "achievements");
  const q = query(ref, orderBy("unlockedAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const achievements = snapshot.docs
        .filter((entry) => entry.id !== "_meta")
        .map((entry) => mapDocToAchievement(entry.id, entry.data() as Record<string, unknown>))
        .filter((entry): entry is UserAchievement => Boolean(entry));
      onData(achievements);
    },
    (error) => onError(error),
  );
}

export async function unlockAchievement(
  uid: string,
  achievementId: AchievementId,
  metrics: AchievementMetrics,
) {
  const definition = getAchievementById(achievementId);
  if (!definition) return { unlocked: false as const };

  const achievementRef = doc(db, "users", uid, "achievements", achievementId);
  const existing = await getDoc(achievementRef);
  if (existing.exists()) {
    return { unlocked: false as const };
  }

  await setDoc(achievementRef, {
    id: definition.id,
    title: definition.title,
    description: definition.description,
    icon: definition.icon,
    rarity: definition.rarity,
    target: definition.target,
    statsSnapshot: metrics,
    unlockedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  return {
    unlocked: true as const,
    achievement: {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      rarity: definition.rarity,
      target: definition.target,
      unlockedAt: new Date(),
      statsSnapshot: metrics,
    } satisfies UserAchievement,
  };
}

