// FRESH MANAGER — Firebase bootstrap
//
// Uses the EXISTING Firebase project (food-finder-ai-8ac84) shared with
// FRESH DETROIT / FRESH ATL. Do not point this at a new project.
// Firestore + Auth only — Storage is intentionally not initialized/used.
//
// ⚠️ ASSUMPTION: the apiKey/appId/messagingSenderId below are placeholders.
// Firebase web config values are not secrets, but they must match the
// REAL config from the food-finder-ai-8ac84 project (Firebase Console →
// Project settings → General → Your apps → SDK setup and configuration).
// Replace the placeholders before this app is run against real data.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "REPLACE_WITH_REAL_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "food-finder-ai-8ac84.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "food-finder-ai-8ac84",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "food-finder-ai-8ac84.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID || "REPLACE_WITH_REAL_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "REPLACE_WITH_REAL_APP_ID",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
