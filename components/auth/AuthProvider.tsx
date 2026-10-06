"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

import { firebase, firebaseConfigured } from "@/lib/firebase";
import type { Profile } from "@/lib/types";

interface AuthState {
  /** False until Firebase has reported the initial sign-in state. */
  ready: boolean;
  user: User | null;
  /** Undefined while loading; null when the profile has not been created. */
  profile: Profile | null | undefined;
  isAdmin: boolean;
  /** True from the moment sign-out starts, so guards do not redirect to sign-in. */
  signingOut: boolean;
  /** Signs out and returns to the homepage. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) {
      setReady(true);
      return;
    }
    const { auth } = firebase();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setProfile(u ? undefined : null);
      setIsAdmin(false);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const { db } = firebase();
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setProfile(snap.exists() ? (snap.data() as Profile) : null),
      () => setProfile(null),
    );
    getDoc(doc(db, "admins", user.uid))
      .then((snap) => setIsAdmin(snap.exists()))
      .catch(() => setIsAdmin(false));
    return unsubscribe;
  }, [user]);

  const value: AuthState = {
    ready,
    user,
    profile,
    isAdmin,
    signingOut,
    signOut: async () => {
      setSigningOut(true);
      await signOut(firebase().auth);
      window.location.replace("/");
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
