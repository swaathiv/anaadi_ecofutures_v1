"use client";

import {
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";

import { Field, FormAlert } from "@/components/forms/Field";
import { errorMessage, firebase } from "@/lib/firebase";
import { isEmail, toE164India } from "@/lib/validation";

type Method = "phone" | "email";

export function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [method, setMethod] = useState<Method>("phone");
  return (
    <div>
      <div role="tablist" aria-label="Sign-in method" className="mb-8 grid grid-cols-2 border border-hairline">
        {(
          [
            ["phone", "Mobile number"],
            ["email", "Email"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            id={`tab-${m}`}
            aria-selected={method === m}
            aria-controls={`panel-${m}`}
            onClick={() => setMethod(m)}
            className={`min-h-12 font-label text-sm font-semibold uppercase tracking-[0.14em] ${
              method === m ? "bg-brand text-paper" : "text-forest hover:bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${method}`} aria-labelledby={`tab-${method}`}>
        {method === "phone" ? <PhoneSignIn onSignedIn={onSignedIn} /> : <EmailSignIn onSignedIn={onSignedIn} />}
      </div>
    </div>
  );
}

function PhoneSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => verifier.current?.clear(), []);
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);
  useEffect(() => {
    if (confirmation) codeRef.current?.focus();
  }, [confirmation]);

  async function sendCode() {
    setError(undefined);
    const e164 = toE164India(phone);
    if (!e164) {
      setError("Enter a 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    try {
      const { auth } = firebase();
      verifier.current ??= new RecaptchaVerifier(auth, "recaptcha-anchor", { size: "invisible" });
      setConfirmation(await signInWithPhoneNumber(auth, e164, verifier.current));
      setResendIn(30);
    } catch (e) {
      setError(errorMessage(e));
      verifier.current?.clear();
      verifier.current = null;
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode() {
    if (!confirmation) return;
    setError(undefined);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from the SMS.");
      return;
    }
    setBusy(true);
    try {
      await confirmation.confirm(code);
      onSignedIn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <FormAlert message={error} />
      {!confirmation ? (
        <form
          className="space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void sendCode();
          }}
        >
          <Field
            label="Mobile number"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            hint="10-digit Indian mobile. We send a one-time code by SMS."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button id="recaptcha-anchor" type="submit" className="btn btn-primary w-full sm:w-auto" disabled={busy}>
            {busy ? "Sending code…" : "Send code"}
          </button>
        </form>
      ) : (
        <form
          className="space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void confirmCode();
          }}
        >
          <p className="text-ink" role="status">
            We sent a 6-digit code to +91 {phone.replace(/\D/g, "").slice(-10)}.
          </p>
          <Field label="Code" name="code" hint="Check your SMS messages." optional={false}>
            {({ id, describedBy }) => (
              <input
                ref={codeRef}
                id={id}
                name="code"
                className="field-input tracking-[0.4em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                aria-describedby={describedBy}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            )}
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Checking…" : "Verify and sign in"}
            </button>
            <button
              type="button"
              className="min-h-11 text-sm text-brand underline underline-offset-4 disabled:text-muted disabled:no-underline"
              disabled={busy || resendIn > 0}
              onClick={() => {
                setConfirmation(null);
                setCode("");
              }}
            >
              {resendIn > 0 ? `Change number or resend in ${resendIn}s` : "Change number or resend"}
            </button>
          </div>
        </form>
      )}
      <p className="text-xs text-muted">
        This site is protected by reCAPTCHA and the Google{" "}
        <a className="underline" href="https://policies.google.com/privacy" rel="noopener noreferrer">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a className="underline" href="https://policies.google.com/terms" rel="noopener noreferrer">
          Terms of Service
        </a>{" "}
        apply.
      </p>
    </div>
  );
}

function EmailSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(undefined);
    setInfo(undefined);
    const e = email.trim().toLowerCase();
    if (!isEmail(e)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Use at least 8 characters for the password.");
    setBusy(true);
    try {
      const { auth } = firebase();
      if (mode === "create") await createUserWithEmailAndPassword(auth, e, password);
      else await signInWithEmailAndPassword(auth, e, password);
      onSignedIn();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setError(undefined);
    const e = email.trim().toLowerCase();
    if (!isEmail(e)) return setError("Enter your email address first.");
    try {
      await sendPasswordResetEmail(firebase().auth, e);
    } catch {
      /* Do not reveal whether the account exists. */
    }
    setInfo("If an account exists for that email, a reset link is on its way.");
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <FormAlert message={error} />
      {info && (
        <p role="status" className="border border-brand bg-sage/50 px-4 py-3 text-forest">
          {info}
        </p>
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "create" ? "new-password" : "current-password"}
        hint={mode === "create" ? "At least 8 characters." : undefined}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Please wait…" : mode === "create" ? "Create account" : "Sign in"}
        </button>
        {mode === "signin" && (
          <button type="button" onClick={reset} className="min-h-11 text-sm text-brand underline underline-offset-4">
            Forgot password?
          </button>
        )}
      </div>
      <p className="text-muted">
        {mode === "signin" ? "New here? " : "Already have an account? "}
        <button
          type="button"
          className="link-quiet"
          onClick={() => {
            setMode(mode === "signin" ? "create" : "signin");
            setError(undefined);
          }}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
