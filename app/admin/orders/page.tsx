import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateOrderStatus } from "@/app/actions/orders";
import { AddressBlock, formatDate, OrderSummary, StatusBadge } from "@/components/account/OrderParts";
import { isAdmin, requireUser } from "@/lib/server/auth";
import { read } from "@/lib/server/db";
import { ORDER_STATUSES, statusLabels } from "@/lib/types";

export const metadata: Metadata = { title: "Manage orders", robots: { index: false, follow: false } };

export default async function AdminOrdersPage() {
  const user = await requireUser("/admin/orders");
  if (!isAdmin(user)) notFound();
  const orders = await read((db) => [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

  return (
    <section className="container-site py-12 md:py-20">
      <p className="eyebrow eyebrow-rule">Admin</p>
      <h1 className="text-page mt-5">Orders</h1>
      <p className="mt-4 text-muted">{orders.length} order(s). Newest first.</p>

      <ul className="mt-10 space-y-6">
        {orders.map((o) => (
          <li key={o.id} className="border border-hairline p-5 md:p-6">
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
                <div className="lg:col-span-1">
                  <h2 className="eyebrow">Deliver to</h2>
                  <div className="mt-2">
                    <AddressBlock d={o.delivery} />
                  </div>
                  <p className="mt-2 text-sm text-muted">Account email: {o.email}</p>
                  {o.notes && <p className="mt-2 text-sm">Note: {o.notes}</p>}
                </div>
                <div className="lg:col-span-1">
                  <h2 className="eyebrow">Items</h2>
                  <div className="mt-2">
                    <OrderSummary order={o} />
                  </div>
                </div>
                <form action={updateOrderStatus} className="space-y-4 lg:col-span-1">
                  <input type="hidden" name="orderId" value={o.id} />
                  <label className="block">
                    <span className="field-label">Status</span>
                    <select name="status" defaultValue={o.status} className="field-input">
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
                      name="note"
                      maxLength={300}
                      className="field-input"
                      placeholder="e.g. Final price ₹… confirmed by phone"
                    />
                  </label>
                  <button type="submit" className="btn btn-primary">
                    Update order
                  </button>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
