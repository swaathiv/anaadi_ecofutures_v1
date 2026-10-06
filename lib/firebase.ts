"use client";

/**
 * Firebase client. Imported only by account/checkout/admin code, so the
 * marketing pages never download the Firebase SDK.
 *
 * The web config values are public by design; access is enforced by
 * firestore.rules and the Cloud Functions.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable, type Functions } from "firebase/functions";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};
const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "asia-south1";
// Emulators only ever apply on this computer, even if the flag leaks into a
// production build.
const useEmulators =
  process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === "true" &&
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let cached: { app: FirebaseApp; auth: Auth; db: Firestore; functions: Functions } | null = null;

export function firebase() {
  if (!firebaseConfigured) throw new Error("Firebase is not configured. See README → Firebase setup.");
  if (cached) return cached;
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app, region);
  if (useEmulators) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  }
  auth.languageCode = "en";
  cached = { app, auth, db, functions };
  return cached;
}

export function callable<Req, Res>(name: string) {
  return (data: Req) => httpsCallable<Req, Res>(firebase().functions, name)(data).then((r) => r.data);
}

/** Human-readable message from a Firebase error. */
export function errorMessage(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-phone-number": "Enter a valid 10-digit mobile number.",
    "auth/invalid-verification-code": "That code is not correct. Check the SMS and try again.",
    "auth/code-expired": "That code has expired. Please request a new one.",
    "auth/too-many-requests": "Too many attempts. Please wait a while and try again.",
    "auth/quota-exceeded": "We cannot send more codes right now. Please try email sign-in or try later.",
    "auth/invalid-credential": "That email and password do not match an account.",
    "auth/wrong-password": "That email and password do not match an account.",
    "auth/user-not-found": "That email and password do not match an account.",
    "auth/email-already-in-use": "An account with this email already exists. Sign in instead.",
    "auth/weak-password": "Use at least 8 characters.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed": "Network problem. Check your connection and try again.",
    "auth/captcha-check-failed": "The security check failed. Please reload the page and try again.",
  };
  if (map[code]) return map[code];
  const message = (error as { message?: string })?.message;
  // Callable functions return our own HttpsError messages.
  if (code.startsWith("functions/") && message) return message;
  return "Something went wrong. Please try again.";
}
