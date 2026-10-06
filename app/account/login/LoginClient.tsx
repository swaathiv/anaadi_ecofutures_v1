"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { NotConfigured } from "@/components/auth/RequireAuth";
import { SignIn } from "@/components/auth/SignIn";
import { useNext } from "@/components/auth/useNext";
import { firebaseConfigured } from "@/lib/firebase";

export function LoginClient() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const next = useNext();

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  if (!firebaseConfigured) return <NotConfigured />;
  if (!ready || user) return <p className="text-muted">Loading…</p>;
  return <SignIn onSignedIn={() => router.replace(next)} />;
}
