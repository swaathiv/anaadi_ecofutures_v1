import "server-only";

import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { read, write, type User } from "./db";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

const COOKIE = "anaadi_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await scryptAsync(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await write((db) => {
    const now = Date.now();
    db.sessions = db.sessions.filter((s) => Date.parse(s.expiresAt) > now);
    db.sessions.push({ tokenHash: sha256(token), userId, expiresAt: expires.toISOString() });
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const hash = sha256(token);
    await write((db) => {
      db.sessions = db.sessions.filter((s) => s.tokenHash !== hash);
    });
  }
  jar.delete(COOKIE);
}

export type PublicUser = Omit<User, "passwordHash">;

export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const hash = sha256(token);
  return read((db) => {
    const session = db.sessions.find((s) => s.tokenHash === hash);
    if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;
    const user = db.users.find((u) => u.id === session.userId);
    if (!user) return null;
    const { passwordHash: _omit, ...rest } = user;
    return structuredClone(rest);
  });
}

/** Only allow same-site relative paths as post-login destinations. */
export function safeNext(next: unknown, fallback = "/account") {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : fallback;
}

export async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return user;
}

export function isAdmin(user: Pick<User, "email"> | null) {
  if (!user) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(user.email.toLowerCase());
}

export const newId = () => randomUUID();

/* Simple in-memory throttle for sign-in attempts (per email + per process). */
const attempts = new Map<string, { count: number; first: number }>();
export function tooManyAttempts(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > 15 * 60_000) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}
export function clearAttempts(key: string) {
  attempts.delete(key);
}
