import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/account/AuthShell";

import { LoginClient } from "./LoginClient";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Your account"
      title="Sign in"
      intro={
        <p>
          Sign in with your mobile number or email to place cash-on-delivery orders, save your delivery address
          and track your orders. Signing in with a mobile number for the first time creates your account.
        </p>
      }
    >
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <LoginClient />
      </Suspense>
    </AuthShell>
  );
}
