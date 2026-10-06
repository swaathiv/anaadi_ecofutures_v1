import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { AddressBlock, formatDate, StatusBadge } from "@/components/account/OrderParts";
import { formatINR } from "@/lib/catalog";
import { isAdmin, requireUser } from "@/lib/server/auth";
import { read } from "@/lib/server/db";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const orders = await read((db) =>
    db.orders.filter((o) => o.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );

  return (
    <section className="container-site py-12 md:py-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow eyebrow-rule">Your account</p>
          <h1 className="text-page mt-5">Namaste, {user.name.split(" ")[0]}.</h1>
          <p className="mt-4 text-muted">
            {user.email} · {user.phone}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin(user) && (
            <Link href="/admin/orders" className="btn btn-secondary">
              Manage orders
            </Link>
          )}
          <form action={logout}>
            <button type="submit" className="btn btn-secondary">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h2 className="font-display text-3xl">Your orders</h2>
          {orders.length === 0 ? (
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
          ) : (
            <ul className="mt-6 border-t border-hairline">
              {orders.map((o) => (
                <li key={o.id} className="border-b border-hairline">
                  <Link
                    href={`/account/orders/${o.id}`}
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
            {user.address ? (
              <AddressBlock d={user.address} />
            ) : (
              <p className="text-muted">Saved when you place an order.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
