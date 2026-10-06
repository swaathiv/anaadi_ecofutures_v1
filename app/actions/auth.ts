"use server";

import { redirect } from "next/navigation";

import {
  clearAttempts,
  createSession,
  destroySession,
  hashPassword,
  newId,
  safeNext,
  tooManyAttempts,
  verifyPassword,
} from "@/lib/server/auth";
import { write, read } from "@/lib/server/db";
import { isEmail, normaliseEmail, normalisePhone, type FieldErrors } from "@/lib/validation";

export interface FormState {
  error?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
}

export async function register(_prev: FormState, form: FormData): Promise<FormState> {
  const name = String(form.get("name") ?? "").trim();
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const phoneRaw = String(form.get("phone") ?? "");
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));
  const values = { name, email, phone: phoneRaw };

  const fieldErrors: FieldErrors = {};
  if (name.length < 2 || name.length > 100) fieldErrors.name = "Enter your name.";
  if (!isEmail(email)) fieldErrors.email = "Enter a valid email address.";
  const phone = normalisePhone(phoneRaw);
  if (!phone) fieldErrors.phone = "Enter a 10-digit Indian mobile number.";
  if (password.length < 8) fieldErrors.password = "Use at least 8 characters.";
  if (password.length > 200) fieldErrors.password = "Use at most 200 characters.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const passwordHash = await hashPassword(password);
  const id = newId();
  const created = await write((db) => {
    if (db.users.some((u) => u.email === email)) return false;
    db.users.push({ id, name, email, phone: phone!, passwordHash, createdAt: new Date().toISOString() });
    return true;
  });
  if (!created) {
    return { fieldErrors: { email: "An account with this email already exists. Sign in instead." }, values };
  }
  await createSession(id);
  redirect(next);
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));
  const values = { email };

  if (!isEmail(email) || !password) {
    return { error: "Enter your email and password.", values };
  }
  if (tooManyAttempts(email)) {
    return { error: "Too many attempts. Please wait 15 minutes and try again.", values };
  }
  const user = await read((db) => db.users.find((u) => u.email === email));
  // Verify against a dummy hash when the user is unknown to keep timing similar.
  const ok = await verifyPassword(
    password,
    user?.passwordHash ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==",
  );
  if (!user || !ok) {
    return { error: "That email and password do not match an account.", values };
  }
  clearAttempts(email);
  await createSession(user.id);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
