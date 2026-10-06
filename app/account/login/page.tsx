import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/account/AuthShell";
import { LoginForm } from "@/components/account/AuthForms";
import { getCurrentUser, safeNext } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <AuthShell
      eyebrow="Your account"
      title="Sign in"
      intro={<p>Sign in to place cash-on-delivery orders, save your delivery address and track your orders.</p>}
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
