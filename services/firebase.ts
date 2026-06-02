import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDL8tGQaUjiAQlwyz3DKY9THWDgT1C-c6M",
  authDomain: "habitflow-88335.firebaseapp.com",
  projectId: "habitflow-88335",
  storageBucket: "habitflow-88335.firebasestorage.app",
  messagingSenderId: "689979739835",
  appId: "1:689979739835:web:8855b1ab4d1c7ed4a0a39e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);