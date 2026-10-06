"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, register, type FormState } from "@/app/actions/auth";
import { Field, FormAlert } from "@/components/forms/Field";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormAlert message={state.error} />
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-muted">
        New here?{" "}
        <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="link-quiet">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormAlert message={state.error ?? (Object.keys(e).length ? "Please check the highlighted fields." : undefined)} />
      <input type="hidden" name="next" value={next} />
      <Field label="Full name" name="name" autoComplete="name" defaultValue={state.values?.name} error={e.name} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.values?.email}
        error={e.email}
      />
      <Field
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        hint="10-digit Indian mobile number, used to arrange delivery."
        defaultValue={state.values?.phone}
        error={e.phone}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={e.password}
      />
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-muted">
        Already have an account?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="link-quiet">
          Sign in
        </Link>
      </p>
    </form>
  );
}
