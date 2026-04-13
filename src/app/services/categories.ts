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

export interface UserCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
  isDefault?: boolean;
}

interface UpsertCategoryInput {
  name: string;
  icon: string;
  color: string;
  budget: number;
}

function mapDocToCategory(id: string, data: Record<string, unknown>): UserCategory {
  const rawColor = (data.color as string) || "bg-emerald-500";
  const color = rawColor.startsWith("bg-") ? rawColor : "bg-emerald-500";
  const rawIcon = ((data.icon as string) || "Tag").trim();
  const icon = rawIcon.charAt(0).toUpperCase() + rawIcon.slice(1);

  return {
    id,
    name: (data.name as string) || "Categoría",
    icon,
    color,
    budget: Number(data.budget || 0),
    isDefault: Boolean(data.isDefault),
  };
}

export function subscribeToUserCategories(
  uid: string,
  onData: (categories: UserCategory[]) => void,
  onError: (error: Error) => void,
) {
  const ref = collection(db, "users", uid, "categories");
  const q = query(ref, orderBy("name", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const categories = snapshot.docs
        .filter((entry) => entry.id !== "_meta")
        .map((entry) => mapDocToCategory(entry.id, entry.data() as Record<string, unknown>));

      onData(categories);
    },
    (error) => onError(error),
  );
}

export async function createUserCategory(uid: string, input: UpsertCategoryInput) {
  const ref = collection(db, "users", uid, "categories");
  await addDoc(ref, {
    ...input,
    budget: Number(input.budget || 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserCategory(
  uid: string,
  categoryId: string,
  input: UpsertCategoryInput,
) {
  const ref = doc(db, "users", uid, "categories", categoryId);
  await updateDoc(ref, {
    ...input,
    budget: Number(input.budget || 0),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserCategory(uid: string, categoryId: string) {
  const ref = doc(db, "users", uid, "categories", categoryId);
  await deleteDoc(ref);
}
