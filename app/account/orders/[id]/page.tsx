import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cancelOrder } from "@/app/actions/orders";
import { ClearBagOnMount } from "@/components/cart/ClearBagOnMount";
import { AddressBlock, formatDate, OrderSummary, OrderTrack, StatusBadge } from "@/components/account/OrderParts";
import { requireUser } from "@/lib/server/auth";
import { read } from "@/lib/server/db";
import { statusLabels } from "@/lib/types";

export const metadata: Metadata = { title: "Order", robots: { index: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const placed = (await searchParams).placed === "1";
  const user = await requireUser(`/account/orders/${id}`);
  const order = await read((db) => db.orders.find((o) => o.id === id && o.userId === user.id));
  if (!order) notFound();

  return (
    <section className="container-site py-12 md:py-20">
      {placed && <ClearBagOnMount />}
      <Link href="/account" className="link-quiet text-sm">
        ← All orders
      </Link>

      {placed && (
        <div role="status" className="mt-6 border border-brand bg-sage/50 px-5 py-4 text-forest">
          Thank you — your order has been placed. Payment is cash on delivery. We will contact you on {order.delivery.phone}{" "}
          to confirm before dispatch.
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
            <form action={cancelOrder}>
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className="btn btn-secondary">
                Cancel order
              </button>
              <p className="mt-2 text-sm text-muted">Orders can be cancelled here until we confirm them.</p>
            </form>
          )}
        </aside>
      </div>
    </section>
  );
}
