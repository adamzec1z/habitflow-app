import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export async function registerUser(email: string, password: string) {
  if (!email.trim()) {
    throw new Error("Email is required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function loginUser(email: string, password: string) {
  if (!email.trim()) {
    throw new Error("Email is required.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logoutUser() {
  return signOut(auth);
}