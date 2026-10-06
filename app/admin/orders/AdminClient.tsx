"use client";

import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { AddressBlock, formatDate, OrderSummary, StatusBadge } from "@/components/account/OrderParts";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { callable, errorMessage, firebase } from "@/lib/firebase";
import { ORDER_STATUSES, statusLabels, type Order, type OrderStatus } from "@/lib/types";
import { displayPhone } from "@/lib/validation";

const updateOrderStatus = callable<{ orderId: string; status: OrderStatus; note: string }, { ok: true }>(
  "updateOrderStatus",
);

export function AdminClient() {
  return (
    <RequireAuth>
      <AdminGate />
    </RequireAuth>
  );
}

function AdminGate() {
  const { isAdmin, user } = useAuth();
  const [checked, setChecked] = useState(false);
  // isAdmin arrives a moment after sign-in; give it a beat before refusing.
  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 1500);
    return () => clearTimeout(t);
  }, []);
  if (isAdmin) return <Orders />;
  if (!checked) return <p className="text-muted">Checking access…</p>;
  return (
    <div>
      <p className="text-ink">This page is for Anaadi Ecofutures staff.</p>
      <p className="mt-2 text-sm text-muted">
        To grant access, add a document with ID <code className="bg-surface px-1">{user?.uid}</code> to the{" "}
        <code className="bg-surface px-1">admins</code> collection in the Firebase console.
      </p>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [error, setError] = useState<string>();

  useEffect(
    () =>
      onSnapshot(
        query(collection(firebase().db, "orders"), orderBy("createdAt", "desc"), limit(300)),
        (snap) => setOrders(snap.docs.map((d) => d.data() as Order)),
        (e) => setError(errorMessage(e)),
      ),
    [],
  );

  const shown = orders?.filter((o) => filter === "all" || o.status === filter) ?? [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-muted">
          {orders ? `${orders.length} order(s), newest first. Updates live.` : "Loading…"}
        </p>
        <label className="flex items-center gap-3">
          <span className="text-sm text-muted">Show</span>
          <select
            className="field-input w-48"
            value={filter}
            onChange={(e) => setFilter(e.target.value as OrderStatus | "all")}
          >
            <option value="all">All orders</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="mt-4 text-error">{error}</p>}
      <ul className="mt-8 space-y-6">
        {shown.map((o) => (
          <AdminOrder key={o.id} order={o} />
        ))}
      </ul>
    </>
  );
}

function AdminOrder({ order: o }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(o.status);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  useEffect(() => setStatus(o.status), [o.status]);

  return (
    <li className="border border-hairline p-5 md:p-6">
      <details>
        <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-medium text-forest">{o.id}</span>
          <span className="text-sm text-muted">{formatDate(o.createdAt)}</span>
          <span className="text-sm">
            {o.delivery.name} · {o.delivery.phone} · {o.delivery.city}
          </span>
          <StatusBadge status={o.status} />
        </summary>
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div>
            <h2 className="eyebrow">Deliver to</h2>
            <div className="mt-2">
              <AddressBlock d={o.delivery} />
            </div>
            <p className="mt-2 text-sm text-muted">
              Account: {o.customer.name}
              {o.customer.phone ? ` · ${displayPhone(o.customer.phone)}` : ""}
              {o.customer.email ? ` · ${o.customer.email}` : ""}
            </p>
            {o.notes && <p className="mt-2 text-sm">Note: {o.notes}</p>}
          </div>
          <div>
            <h2 className="eyebrow">Items</h2>
            <div className="mt-2">
              <OrderSummary order={o} />
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setMessage(undefined);
              try {
                await updateOrderStatus({ orderId: o.id, status, note });
                setNote("");
                setMessage("Updated.");
              } catch (err) {
                setMessage(errorMessage(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="block">
              <span className="field-label">Status</span>
              <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">
                Note to customer <span className="font-normal text-muted">(optional)</span>
              </span>
              <input
                className="field-input"
                maxLength={300}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Final price ₹… confirmed by phone"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Update order"}
            </button>
            {message && (
              <p role="status" className="text-sm text-muted">
                {message}
              </p>
            )}
          </form>
        </div>
      </details>
    </li>
  );
}
