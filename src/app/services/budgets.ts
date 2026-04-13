import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
}

export interface UserBudgetSettings {
  totalBudget: number;
  categories: BudgetCategory[];
  updatedAt?: Date;
}

const DEFAULT_BUDGET: UserBudgetSettings = {
  totalBudget: 0,
  categories: [],
};

function toDateValue(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }

  return undefined;
}

export async function getUserBudget(uid: string) {
  const ref = doc(db, "users", uid, "budgets", "_meta");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return DEFAULT_BUDGET;
  }

  const data = snap.data() as Record<string, unknown>;
  const categoriesRaw = Array.isArray(data.categories)
    ? (data.categories as Array<Record<string, unknown>>)
    : [];

  const categories = categoriesRaw
    .map((category, index) => ({
      id:
        (category.id as string | undefined) ||
        `${(category.name as string | undefined) || "cat"}-${index}`,
      name: (category.name as string) || "Categoría",
      limit: Number(category.limit || 0),
    }))
    .filter((category) => category.name.trim().length > 0);

  return {
    totalBudget: Number(data.totalBudget || data.limitAmount || 0),
    categories,
    updatedAt: toDateValue(data.updatedAt),
  } as UserBudgetSettings;
}

export async function upsertUserBudget(uid: string, input: UserBudgetSettings) {
  const ref = doc(db, "users", uid, "budgets", "_meta");

  await setDoc(
    ref,
    {
      totalBudget: Number(input.totalBudget || 0),
      categories: input.categories.map((category) => ({
        id: category.id,
        name: category.name,
        limit: Number(category.limit || 0),
      })),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
