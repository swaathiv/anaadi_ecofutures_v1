"use client";

import Image from "next/image";
import Link from "next/link";

import { formatINR, getProduct, quote } from "@/lib/catalog";
import { ordering } from "@/lib/content/site";
import { ArrowRight } from "@/components/ui/Icons";

import { OrderingClosed } from "./AddToBag";
import { useCart } from "./CartProvider";

export function QuoteTotals({ items }: { items: { slug: string; quantity: number }[] }) {
  const q = quote(items);
  return (
    <dl className="space-y-1 text-[0.9375rem]">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal{q.hasUnpricedItems ? " (priced items)" : ""}</dt>
        <dd>{formatINR(q.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">Shipping</dt>
        <dd>{q.shipping === 0 ? "Free" : formatINR(q.shipping)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">Cash-on-delivery fee</dt>
        <dd>{formatINR(q.codFee)}</dd>
      </div>
      <div className="flex justify-between border-t border-hairline pt-2 font-medium text-forest">
        <dt>{q.hasUnpricedItems ? "Amount so far" : "Pay on delivery"}</dt>
        <dd>{formatINR(q.total)}</dd>
      </div>
      {q.hasUnpricedItems && (
        <p className="pt-2 text-sm text-muted">
          Saree prices are confirmed with you before dispatch, together with the final amount.
        </p>
      )}
    </dl>
  );
}

export function BagView() {
  const { items, ready, setQuantity, remove } = useCart();

  if (!ordering.enabled) return <OrderingClosed />;
  if (!ready) return <p className="text-muted">Loading your bag…</p>;

  const lines = items
    .map((i) => ({ item: i, product: getProduct(i.slug) }))
    .filter((l): l is { item: typeof l.item; product: NonNullable<typeof l.product> } => Boolean(l.product));

  if (lines.length === 0) {
    return (
      <div>
        <p className="text-ink">Your bag is empty.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/vastras#collection" className="btn btn-secondary">
            Anaadi Vastras
          </Link>
          <Link href="/energy#varatti" className="btn btn-secondary">
            Handmade varatti
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <ul className="border-t border-hairline lg:col-span-8">
        {lines.map(({ item, product }) => {
          const img = product.images[0];
          const href = product.line === "vastras" ? `/vastras/${product.slug}` : "/energy#varatti";
          return (
            <li key={product.slug} className="flex gap-5 border-b border-hairline py-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-hairline bg-surface">
                {img && <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={href} className="font-display text-xl text-forest hover:text-brand">
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {product.price !== undefined ? `${formatINR(product.price)} each` : "Price confirmed before dispatch"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {product.maxPerOrder > 1 ? (
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-muted">Qty</span>
                      <select
                        className="field-input min-h-11 w-20 py-1"
                        value={item.quantity}
                        onChange={(e) => setQuantity(product.slug, Number(e.target.value))}
                        aria-label={`Quantity of ${product.name}`}
                      >
                        {Array.from({ length: Math.min(product.maxPerOrder, 20) }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <span className="text-sm text-muted">Qty 1</span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(product.slug)}
                    className="min-h-11 text-sm text-brand underline underline-offset-4 hover:text-forest"
                  >
                    Remove<span className="sr-only"> {product.name}</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <aside className="lg:col-span-4">
        <div className="border border-hairline bg-surface p-6">
          <h2 className="font-display text-2xl">Summary</h2>
          <div className="mt-4">
            <QuoteTotals items={items} />
          </div>
          <Link href="/checkout" className="btn btn-primary mt-6 w-full">
            Continue to delivery
            <ArrowRight />
          </Link>
          <p className="mt-3 text-sm text-muted">Payment: cash on delivery only.</p>
        </div>
      </aside>
    </div>
  );
}
