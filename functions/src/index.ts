/**
 * Cloud Functions for Anaadi Ecofutures orders.
 *
 * Orders are written ONLY here (Firestore rules deny client writes), so the
 * price of every line is fixed from lib/pricing.ts at the moment the order is
 * placed and can never be supplied or changed by a browser.
 */
import { randomBytes } from "node:crypto";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall, type CallableRequest } from "firebase-functions/v2/https";

import { quote } from "../../lib/pricing";
import { ORDER_STATUSES, type Order, type OrderStatus, type Profile } from "../../lib/types";
import { parseDelivery } from "../../lib/validation";

initializeApp();
const db = getFirestore();

// Mumbai, next to the Firestore database. Keep in sync with
// NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION on the website.
setGlobalOptions({ region: "asia-south1", maxInstances: 5 });

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

export const placeOrder = onCall(async (req) => {
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

  const profileSnap = await db.doc(`users/${uid}`).get();
  const profile = profileSnap.data() as Profile | undefined;
  if (!profile?.name) throw new HttpsError("failed-precondition", "Please complete your profile first.");

  // Simple abuse guard.
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

export const cancelOrder = onCall(async (req) => {
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

export const updateOrderStatus = onCall(async (req) => {
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

/** Firestore rejects `undefined` values. */
function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}
