import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/account/AuthShell";
import { RegisterForm } from "@/components/account/AuthForms";
import { getCurrentUser, safeNext } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <AuthShell
      eyebrow="Your account"
      title="Create an account"
      intro={<p>An account lets you place cash-on-delivery orders and follow each order from placement to delivery.</p>}
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
