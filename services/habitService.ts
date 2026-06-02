import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type HabitInput = {
  name: string;
  category: string;
  frequency: string;
  reminderTime?: string;
};

export type Habit = HabitInput & {
  id: string;
  userId: string;
  completedToday: boolean;
  lastCompletedDate?: string;
};

export function validateHabitName(name: string) {
  return name.trim().length > 0;
}

export async function createHabit(userId: string, habit: HabitInput) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!validateHabitName(habit.name)) {
    throw new Error("Habit name is required.");
  }

  return addDoc(collection(db, "habits"), {
    userId,
    name: habit.name.trim(),
    category: habit.category || "General",
    frequency: habit.frequency || "Daily",
    reminderTime: habit.reminderTime || "",
    completedToday: false,
    lastCompletedDate: "",
    createdAt: serverTimestamp(),
  });
}

export async function getUserHabits(userId: string): Promise<Habit[]> {
  const habitsQuery = query(
    collection(db, "habits"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(habitsQuery);

  return snapshot.docs.map((habitDoc) => ({
    id: habitDoc.id,
    ...(habitDoc.data() as Omit<Habit, "id">),
  }));
}

export async function markHabitComplete(habitId: string) {
  const today = new Date().toISOString().split("T")[0];

  return updateDoc(doc(db, "habits", habitId), {
    completedToday: true,
    lastCompletedDate: today,
  });
}

export async function updateHabit(habitId: string, habit: Partial<HabitInput>) {
  return updateDoc(doc(db, "habits", habitId), habit);
}

export async function deleteHabit(habitId: string) {
  return deleteDoc(doc(db, "habits", habitId));
}