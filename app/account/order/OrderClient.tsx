"use client";

import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AddressBlock, formatDate, OrderSummary, OrderTrack, StatusBadge } from "@/components/account/OrderParts";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ClearBagOnMount } from "@/components/cart/ClearBagOnMount";
import { callable, errorMessage, firebase } from "@/lib/firebase";
import { statusLabels, type Order } from "@/lib/types";

const cancelOrder = callable<{ orderId: string }, { ok: true }>("cancelOrder");

export function OrderClient() {
  return (
    <RequireAuth>
      <OrderView />
    </RequireAuth>
  );
}

function OrderView() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const placed = params.get("placed") === "1";
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !id) {
      setOrder(null);
      return;
    }
    // Live: status changes made by Anaadi appear without a reload.
    return onSnapshot(
      doc(firebase().db, "orders", id),
      (snap) => setOrder(snap.exists() ? (snap.data() as Order) : null),
      () => setOrder(null), // permission denied = not this customer's order
    );
  }, [user, id]);

  if (order === undefined) return <p className="text-muted">Loading order…</p>;
  if (order === null) {
    return (
      <div>
        <h1 className="text-page">Order not found.</h1>
        <p className="mt-6">
          <Link href="/account" className="btn btn-secondary">
            Your orders
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      {placed && <ClearBagOnMount />}
      <Link href="/account" className="link-quiet text-sm">
        ← All orders
      </Link>

      {placed && (
        <div role="status" className="mt-6 border border-brand bg-sage/50 px-5 py-4 text-forest">
          Thank you — your order has been placed. Payment is cash on delivery. We will contact you on{" "}
          {order.delivery.phone} to confirm before dispatch.
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Order {order.id}</p>
          <h1 className="text-page mt-3">{statusLabels[order.status]}</h1>
          <p className="mt-3 text-muted">Placed {formatDate(order.createdAt)} · Cash on delivery</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-10">
        <OrderTrack order={order} />
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-display text-3xl">Items</h2>
          <div className="mt-5">
            <OrderSummary order={order} />
          </div>
        </div>
        <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
          <div>
            <h2 className="font-display text-3xl">Delivery</h2>
            <div className="mt-4">
              <AddressBlock d={order.delivery} />
            </div>
            {order.notes && <p className="mt-4 text-sm text-muted">Note: {order.notes}</p>}
          </div>
          <div>
            <h2 className="font-display text-3xl">Updates</h2>
            <ol className="mt-4 space-y-3 border-l border-hairline pl-5">
              {[...order.history].reverse().map((h, i) => (
                <li key={i}>
                  <p className="font-medium text-forest">{statusLabels[h.status]}</p>
                  <p className="text-sm text-muted">{formatDate(h.at)}</p>
                  {h.note && <p className="text-sm text-ink">{h.note}</p>}
                </li>
              ))}
            </ol>
          </div>
          {order.status === "placed" && (
            <div>
              {error && <p className="mb-3 text-sm text-error">{error}</p>}
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={async () => {
                  if (!window.confirm("Cancel this order?")) return;
                  setBusy(true);
                  setError(undefined);
                  try {
                    await cancelOrder({ orderId: order.id });
                  } catch (e) {
                    setError(errorMessage(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Cancelling…" : "Cancel order"}
              </button>
              <p className="mt-2 text-sm text-muted">Orders can be cancelled here until we confirm them.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
