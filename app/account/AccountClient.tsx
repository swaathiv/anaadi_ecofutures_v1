"use client";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AddressBlock, formatDate, StatusBadge } from "@/components/account/OrderParts";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { formatINR } from "@/lib/catalog";
import { errorMessage, firebase } from "@/lib/firebase";
import type { Order } from "@/lib/types";
import { displayPhone } from "@/lib/validation";

export function AccountClient() {
  return (
    <RequireAuth>
      <Account />
    </RequireAuth>
  );
}

function Account() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(firebase().db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    getDocs(q)
      .then((snap) => setOrders(snap.docs.map((d) => d.data() as Order)))
      .catch((e) => setError(errorMessage(e)));
  }, [user]);

  if (!profile) return null;
  const contact = [profile.email, displayPhone(profile.phone)].filter(Boolean).join(" · ");

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow eyebrow-rule">Your account</p>
          <h1 className="text-page mt-5">Namaste, {profile.name.split(" ")[0]}.</h1>
          {contact && <p className="mt-4 text-muted">{contact}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Link href="/admin/orders" className="btn btn-secondary">
              Manage orders
            </Link>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h2 className="font-display text-3xl">Your orders</h2>
          {error && <p className="mt-4 text-error">{error}</p>}
          {!orders && !error && <p className="mt-4 text-muted">Loading your orders…</p>}
          {orders?.length === 0 && (
            <p className="mt-4 text-ink">
              No orders yet. Browse{" "}
              <Link href="/vastras" className="link-quiet">
                Anaadi Vastras
              </Link>{" "}
              or{" "}
              <Link href="/energy#varatti" className="link-quiet">
                handmade varatti
              </Link>
              .
            </p>
          )}
          {orders && orders.length > 0 && (
            <ul className="mt-6 border-t border-hairline">
              {orders.map((o) => (
                <li key={o.id} className="border-b border-hairline">
                  <Link
                    href={`/account/order?id=${encodeURIComponent(o.id)}`}
                    className="grid gap-2 py-5 hover:bg-surface sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6 sm:px-2"
                  >
                    <span>
                      <span className="block font-medium text-forest">Order {o.id}</span>
                      <span className="block text-sm text-muted">
                        {formatDate(o.createdAt)} · {o.lines.reduce((n, l) => n + l.quantity, 0)} item(s)
                      </span>
                    </span>
                    <span className="text-forest">
                      {formatINR(o.total)}
                      {o.hasUnpricedItems ? "+" : ""}
                    </span>
                    <StatusBadge status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="lg:col-span-4">
          <h2 className="font-display text-3xl">Delivery address</h2>
          <div className="mt-4">
            {profile.address ? (
              <AddressBlock d={profile.address} />
            ) : (
              <p className="text-muted">Saved when you place an order.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
