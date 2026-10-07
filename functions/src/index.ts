/**
 * Cloud Functions for Anaadi Ecofutures orders.
 *
 * Orders are written ONLY here (Firestore rules deny client writes), so the
 * price of every line is fixed from lib/pricing.ts at the moment the order is
 * placed and can never be supplied or changed by a browser.
 */
import { randomBytes } from "node:crypto";

import { initializeApp } from "firebase-admin/app";
import { getAuth, type UserRecord } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { logger, setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall as rawOnCall, type CallableRequest } from "firebase-functions/v2/https";

import { quote } from "../../lib/pricing";
import {
  ORDER_STATUSES,
  REFERRAL_SOURCES,
  type AdminEntry,
  type Order,
  type OrderStatus,
  type Profile,
} from "../../lib/types";
import { isEmail, normaliseEmail, parseDelivery, toE164India } from "../../lib/validation";

initializeApp();
const db = getFirestore();

// Mumbai, next to the Firestore database. Keep in sync with
// NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION on the website.
setGlobalOptions({ region: "asia-south1", maxInstances: 5 });

/**
 * onCall with error reporting: expected errors (HttpsError) pass through;
 * anything else is logged in full (Firebase console → Functions → Logs) and
 * returned as a readable message instead of a bare "internal".
 */
function onCall<T>(name: string, handler: (req: CallableRequest) => Promise<T>) {
  return rawOnCall(async (req) => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error(`${name} failed`, error);
      const detail = error instanceof Error ? error.message.slice(0, 160) : String(error).slice(0, 160);
      throw new HttpsError("internal", `Server error in ${name}: ${detail}`);
    }
  });
}

const ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 32 chars: no bias from % 32
function newOrderId() {
  let id = "";
  for (const b of randomBytes(8)) id += ID_ALPHABET[b % ID_ALPHABET.length];
  return `AE-${id.slice(0, 4)}-${id.slice(4)}`;
}

function requireUid(req: CallableRequest) {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Please sign in.");
  return uid;
}

async function isAdmin(uid: string) {
  return (await db.doc(`admins/${uid}`).get()).exists;
}

const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const MAX_ORDERS_PER_DAY = 10;

export const placeOrder = onCall("placeOrder", async (req) => {
  const uid = requireUid(req);
  const data = asObject(req.data);

  const { data: delivery, errors } = parseDelivery(asObject(data.delivery));
  if (!delivery) {
    throw new HttpsError("invalid-argument", "Please check the highlighted fields.", { fieldErrors: errors });
  }

  const items = Array.isArray(data.items)
    ? data.items.map((i) => asObject(i)).map((i) => ({ slug: String(i.slug ?? ""), quantity: Number(i.quantity) }))
    : [];
  const priced = quote(items);
  if (priced.lines.length === 0) throw new HttpsError("invalid-argument", "Your bag is empty.");

  const notes = typeof data.notes === "string" ? data.notes.trim().slice(0, 500) : "";
  const saveAddress = data.saveAddress === true;

  // Optional "How did you hear about us?" — only known options are stored.
  const ref = asObject(data.referral);
  const source = typeof ref.source === "string" ? ref.source : "";
  let referral: Order["referral"];
  if ((REFERRAL_SOURCES as readonly string[]).includes(source)) {
    const detail = typeof ref.detail === "string" ? ref.detail.trim().slice(0, 120) : "";
    referral = detail ? { source, detail } : { source };
  }

  const profileSnap = await db.doc(`users/${uid}`).get();
  const profile = profileSnap.data() as Profile | undefined;
  if (!profile?.name) throw new HttpsError("failed-precondition", "Please complete your profile first.");

  // Simple abuse guard. It needs a Firestore index (firestore.indexes.json);
  // if the index is missing or still building, log it and let the order
  // through rather than blocking a genuine customer.
  try {
    const since = new Date(Date.now() - 864e5).toISOString();
    const recent = await db
      .collection("orders")
      .where("userId", "==", uid)
      .where("createdAt", ">=", since)
      .count()
      .get();
    if (recent.data().count >= MAX_ORDERS_PER_DAY) {
      throw new HttpsError("resource-exhausted", "Too many orders today. Please contact us.");
    }
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.warn("Order rate check skipped (index missing or building?)", error);
  }

  const now = new Date().toISOString();
  const customer: Order["customer"] = { name: profile.name };
  if (profile.phone) customer.phone = profile.phone;
  if (profile.email) customer.email = profile.email;

  for (let attempt = 0; attempt < 3; attempt++) {
    const id = newOrderId();
    const order: Order = {
      id,
      userId: uid,
      customer,
      lines: priced.lines,
      delivery: stripUndefined(delivery),
      ...(notes ? { notes } : {}),
      ...(referral ? { referral } : {}),
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      codFee: priced.codFee,
      total: priced.total,
      hasUnpricedItems: priced.hasUnpricedItems,
      paymentMethod: "cod",
      status: "placed",
      history: [{ status: "placed", at: now }],
      createdAt: now,
      updatedAt: now,
    };
    try {
      await db.doc(`orders/${id}`).create(order); // fails if the id already exists
    } catch (error) {
      if ((error as { code?: number }).code === 6 /* ALREADY_EXISTS */) continue;
      throw error;
    }
    if (saveAddress) await db.doc(`users/${uid}`).set({ address: order.delivery }, { merge: true });
    return { id };
  }
  throw new HttpsError("internal", "Could not create the order. Please try again.");
});

export const cancelOrder = onCall("cancelOrder", async (req) => {
  const uid = requireUid(req);
  const id = String(asObject(req.data).orderId ?? "");
  const ref = db.doc(`orders/${id}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const order = snap.data() as Order | undefined;
    if (!order || order.userId !== uid) throw new HttpsError("not-found", "Order not found.");
    if (order.status !== "placed") {
      throw new HttpsError("failed-precondition", "This order has been confirmed. Please contact us to change it.");
    }
    const at = new Date().toISOString();
    tx.update(ref, {
      status: "cancelled",
      updatedAt: at,
      history: [...order.history, { status: "cancelled", at, note: "Cancelled by customer" }],
    });
  });
  return { ok: true };
});

export const updateOrderStatus = onCall("updateOrderStatus", async (req) => {
  const uid = requireUid(req);
  if (!(await isAdmin(uid))) throw new HttpsError("permission-denied", "Admins only.");
  const data = asObject(req.data);
  const id = String(data.orderId ?? "");
  const status = String(data.status ?? "") as OrderStatus;
  const note = typeof data.note === "string" ? data.note.trim().slice(0, 300) : "";
  if (!ORDER_STATUSES.includes(status)) throw new HttpsError("invalid-argument", "Unknown status.");

  const ref = db.doc(`orders/${id}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const order = snap.data() as Order | undefined;
    if (!order) throw new HttpsError("not-found", "Order not found.");
    if (order.status === status && !note) return;
    const at = new Date().toISOString();
    tx.update(ref, {
      status,
      updatedAt: at,
      history: [...order.history, { status, at, ...(note ? { note } : {}) }],
    });
  });
  return { ok: true };
});

/**
 * Add or remove an admin by email or Indian mobile number. Admins only.
 * The person must already have signed in to the site once (so they have an
 * account). The last remaining admin cannot be removed.
 */
export const setAdmin = onCall("setAdmin", async (req) => {
  const uid = requireUid(req);
  if (!(await isAdmin(uid))) throw new HttpsError("permission-denied", "Admins only.");
  const data = asObject(req.data);
  const action = data.action === "remove" ? "remove" : "add";
  const identifier = typeof data.identifier === "string" ? data.identifier.trim() : "";

  let target: UserRecord;
  try {
    if (isEmail(normaliseEmail(identifier))) {
      target = await getAuth().getUserByEmail(normaliseEmail(identifier));
    } else {
      const phone = toE164India(identifier);
      if (!phone) throw new HttpsError("invalid-argument", "Enter an email address or a 10-digit mobile number.");
      target = await getAuth().getUserByPhoneNumber(phone);
    }
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError(
      "not-found",
      "No account found. Ask them to sign in to the website once, then try again.",
    );
  }

  const ref = db.doc(`admins/${target.uid}`);
  if (action === "remove") {
    const count = (await db.collection("admins").count().get()).data().count;
    if (count <= 1) throw new HttpsError("failed-precondition", "You cannot remove the last admin.");
    await ref.delete();
    return { ok: true, uid: target.uid };
  }

  const profile = (await db.doc(`users/${target.uid}`).get()).data() as Profile | undefined;
  const entry: AdminEntry = {
    role: "admin",
    addedBy: uid,
    addedAt: new Date().toISOString(),
  };
  const name = profile?.name ?? target.displayName;
  if (name) entry.name = name;
  if (target.email) entry.email = target.email;
  if (target.phoneNumber) entry.phone = target.phoneNumber;
  await ref.set(entry, { merge: true });
  return { ok: true, uid: target.uid };
});

/** Firestore rejects `undefined` values. */
function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}
