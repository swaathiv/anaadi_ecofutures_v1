"use client";

import { doc, setDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Field, FormAlert } from "@/components/forms/Field";
import { errorMessage, firebase, firebaseConfigured } from "@/lib/firebase";
import { isEmail, toE164India } from "@/lib/validation";

import { useAuth } from "./AuthProvider";

export function NotConfigured() {
  return (
    <p className="text-ink">
      Accounts and ordering are not switched on yet. Please write to us to order in the meantime.
    </p>
  );
}

/**
 * Renders children only for a signed-in user with a profile. Sends signed-out
 * visitors to the sign-in page and asks new users for their name first.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, user, profile, signingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && firebaseConfigured && !user && !signingOut) {
      const next = pathname + window.location.search;
      router.replace(`/account/login?next=${encodeURIComponent(next)}`);
    }
  }, [ready, user, signingOut, pathname, router]);

  if (!firebaseConfigured) return <NotConfigured />;
  if (!ready || !user || profile === undefined) return <p className="text-muted">Loading…</p>;
  if (profile === null) return <CompleteProfile />;
  return <>{children}</>;
}

/** First sign-in: collect the name (and phone for email accounts). */
export function CompleteProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const needsPhone = !user.phoneNumber;

  async function save() {
    const fieldErrors: Record<string, string> = {};
    const n = name.trim();
    if (n.length < 2 || n.length > 100) fieldErrors.name = "Enter your full name.";
    const e164 = user!.phoneNumber ?? toE164India(phone);
    if (!e164) fieldErrors.phone = "Enter a 10-digit Indian mobile number.";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;
    setBusy(true);
    try {
      const email = user!.email && isEmail(user!.email) ? user!.email : undefined;
      await setDoc(doc(firebase().db, "users", user!.uid), {
        name: n,
        phone: e164,
        ...(email ? { email } : {}),
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl">Welcome. One more step.</h2>
      <p className="mt-3 text-ink">Tell us your name so we can address your deliveries.</p>
      <form
        className="mt-8 space-y-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <FormAlert message={error} />
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        {needsPhone && (
          <Field
            label="Mobile number"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            hint="Used to confirm orders and arrange delivery."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
          />
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
