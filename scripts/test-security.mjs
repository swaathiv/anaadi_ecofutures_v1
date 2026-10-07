/**
 * Security checks against the Firebase emulators.
 *
 *   npm run emulators          # terminal 1
 *   npm run test:security      # terminal 2
 *
 * Wipes the emulator data, then tries the things a dishonest customer might:
 * writing orders directly, faking prices, reading others' data, making
 * themselves admin. Exits non-zero if any check fails.
 */
import assert from "node:assert/strict";

import { initializeApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { connectFirestoreEmulator, doc, getDoc, getDocs, collection, getFirestore, setDoc } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";

const PROJECT = "demo-anaadi";
await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: "DELETE" });
await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: "DELETE" });

const app = initializeApp({ apiKey: "demo-key", projectId: PROJECT, appId: "1:0:web:0" });
const auth = getAuth(app);
const db = getFirestore(app);
const fns = getFunctions(app, "asia-south1");
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectFunctionsEmulator(fns, "127.0.0.1", 5001);
const call = (name, data) => httpsCallable(fns, name)(data).then((r) => r.data);

let failures = 0;
async function check(label, fn) {
  try {
    await fn();
    console.log(`  ok   ${label}`);
  } catch (error) {
    failures++;
    console.log(`  FAIL ${label}\n       ${error.message}`);
  }
}
const denied = async (promise) => {
  await assert.rejects(promise, (e) => /permission|PERMISSION_DENIED|insufficient/i.test(`${e.code} ${e.message}`));
};
const rejectsWith = async (promise, code) => {
  await assert.rejects(promise, (e) => e.code === code);
};
const delivery = {
  name: "Test Person",
  phone: "9876543210",
  line1: "1 Test Street",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "600001",
};

// Customer A
const a = await createUserWithEmailAndPassword(auth, "a@example.com", "password-a-123");
const uidA = a.user.uid;

console.log("Profiles");
await check("cannot place an order before creating a profile", () =>
  rejectsWith(call("placeOrder", { items: [{ slug: "varatti-1kg", quantity: 1 }], delivery }), "functions/failed-precondition"),
);
await check("profile with an unexpected field is rejected", () =>
  denied(setDoc(doc(db, "users", uidA), { name: "A", createdAt: new Date().toISOString(), isAdmin: true })),
);
await check("valid profile is accepted", () =>
  setDoc(doc(db, "users", uidA), { name: "Customer A", phone: "+919876543210", createdAt: new Date().toISOString() }),
);

console.log("Orders");
await check("browser cannot write an order directly", () =>
  denied(setDoc(doc(db, "orders", "AE-FAKE-0001"), { userId: uidA, total: 1, status: "delivered" })),
);
let orderId;
await check("prices sent by the browser are ignored", async () => {
  const res = await call("placeOrder", {
    items: [{ slug: "varatti-10kg", quantity: 2, unitPrice: 1, lineTotal: 2 }],
    delivery,
    total: 1,
  });
  orderId = res.id;
  const order = (await getDoc(doc(db, "orders", orderId))).data();
  assert.equal(order.lines[0].unitPrice, 1300);
  assert.equal(order.subtotal, 2600);
  assert.equal(order.shipping, 0);
  assert.equal(order.total, 2650);
  assert.equal(order.userId, uidA);
});
await check("quantity above the per-order limit is clamped", async () => {
  const res = await call("placeOrder", { items: [{ slug: "ivory-magenta-pallu", quantity: 50 }], delivery });
  const order = (await getDoc(doc(db, "orders", res.id))).data();
  assert.equal(order.lines[0].quantity, 1);
  assert.equal(order.hasUnpricedItems, true);
});
await check("unknown products are refused", () =>
  rejectsWith(call("placeOrder", { items: [{ slug: "gold-bar", quantity: 1 }], delivery }), "functions/invalid-argument"),
);
await check("invalid delivery details are refused", () =>
  rejectsWith(
    call("placeOrder", { items: [{ slug: "varatti-1kg", quantity: 1 }], delivery: { ...delivery, pincode: "12" } }),
    "functions/invalid-argument",
  ),
);
await check("customer cannot change order status", () =>
  rejectsWith(call("updateOrderStatus", { orderId, status: "delivered" }), "functions/permission-denied"),
);
await check("customer cannot make themselves admin", () => denied(setDoc(doc(db, "admins", uidA), { role: "owner" })));
await check("customer cannot add admins through the function", () =>
  rejectsWith(call("setAdmin", { identifier: "a@example.com", action: "add" }), "functions/permission-denied"),
);
await check("customer cannot list admins", () => denied(getDocs(collection(db, "admins"))));
await check("valid referral answer is stored; unknown ones are dropped", async () => {
  const good = await call("placeOrder", {
    items: [{ slug: "varatti-1kg", quantity: 1 }],
    delivery,
    referral: { source: "Instagram", detail: "  saw a reel  " },
  });
  const bad = await call("placeOrder", {
    items: [{ slug: "varatti-1kg", quantity: 1 }],
    delivery,
    referral: { source: "<script>", detail: "x" },
  });
  const g = (await getDoc(doc(db, "orders", good.id))).data();
  const b = (await getDoc(doc(db, "orders", bad.id))).data();
  assert.deepEqual(g.referral, { source: "Instagram", detail: "saw a reel" });
  assert.equal(b.referral, undefined);
});

// Customer B
await signOut(auth);
const b = await createUserWithEmailAndPassword(auth, "b@example.com", "password-b-123");
await setDoc(doc(db, "users", b.user.uid), { name: "Customer B", createdAt: new Date().toISOString() });
console.log("Isolation");
await check("another customer cannot read the order", () => denied(getDoc(doc(db, "orders", orderId))));
await check("another customer cannot list all orders", () => denied(getDocs(collection(db, "orders"))));
await check("another customer cannot read A's profile", () => denied(getDoc(doc(db, "users", uidA))));
await check("another customer cannot overwrite A's profile", () =>
  denied(setDoc(doc(db, "users", uidA), { name: "Hacked", createdAt: new Date().toISOString() })),
);
await check("another customer cannot cancel A's order", () =>
  rejectsWith(call("cancelOrder", { orderId }), "functions/not-found"),
);

// Admin flow (grant via emulator owner bypass, as you would in the console)
await fetch(`http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents/admins?documentId=${b.user.uid}`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
  body: JSON.stringify({ fields: { role: { stringValue: "owner" } } }),
});
console.log("Admin");
await check("admin can read every order", async () => {
  const snap = await getDocs(collection(db, "orders"));
  assert.ok(snap.size >= 2);
});
await check("admin can confirm an order", () => call("updateOrderStatus", { orderId, status: "confirmed", note: "Called" }));
await check("admin can list admins", async () => {
  const snap = await getDocs(collection(db, "admins"));
  assert.equal(snap.size, 1);
});
await check("admin cannot remove the last admin", () =>
  rejectsWith(call("setAdmin", { identifier: "b@example.com", action: "remove" }), "functions/failed-precondition"),
);
await check("adding an unknown person explains they must sign in first", () =>
  rejectsWith(call("setAdmin", { identifier: "nobody@example.com", action: "add" }), "functions/not-found"),
);
await check("admin can add another admin by email", async () => {
  await call("setAdmin", { identifier: "A@Example.com", action: "add" });
  const entry = (await getDoc(doc(db, "admins", uidA))).data();
  assert.equal(entry.email, "a@example.com");
  assert.equal(entry.name, "Customer A");
});
await check("admin can remove an admin when another remains", async () => {
  await call("setAdmin", { identifier: "a@example.com", action: "remove" });
  assert.equal((await getDoc(doc(db, "admins", uidA))).exists(), false);
});

await signOut(auth);
const { signInWithEmailAndPassword } = await import("firebase/auth");
await signInWithEmailAndPassword(auth, "a@example.com", "password-a-123");
console.log("Cancellation");
await check("customer cannot cancel once confirmed", () =>
  rejectsWith(call("cancelOrder", { orderId }), "functions/failed-precondition"),
);
await check("customer sees the admin's update", async () => {
  const order = (await getDoc(doc(db, "orders", orderId))).data();
  assert.equal(order.status, "confirmed");
  assert.equal(order.history.at(-1).note, "Called");
});

console.log(failures ? `\n${failures} check(s) failed` : "\nAll security checks passed");
process.exit(failures ? 1 : 0);
