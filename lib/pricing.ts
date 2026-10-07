/**
 * Price list and order rules — the single source of truth.
 *
 * Shared by the website (display) and the `placeOrder` Cloud Function, which
 * is the only place an order's prices are fixed. Keep this file free of
 * imports so the functions build can compile it.
 *
 * To change a price: edit it here, then deploy BOTH the site and the
 * functions (`npm run deploy`). Existing orders keep the price they were
 * placed at.
 *
 * Prices are whole rupees. `price: null` = confirmed with the customer
 * before dispatch.
 */

export interface PriceEntry {
  name: string;
  price: number | null;
  maxPerOrder: number;
}

export const priceList: Record<string, PriceEntry> = {
  // Sarees: ₹1,500 each (supplied price).
  "magenta-peacock-blue-pallu": { name: "Magenta with Peacock-Blue Pallu", price: 1500, maxPerOrder: 1 },
  "orange-peacock-blue-pallu": { name: "Orange with Peacock-Blue Pallu", price: 1500, maxPerOrder: 1 },
  "ivory-magenta-pallu": { name: "Ivory with Magenta Pallu", price: 1500, maxPerOrder: 1 },
  "coral-peacock-blue-pallu": { name: "Coral with Peacock-Blue Pallu", price: 1500, maxPerOrder: 1 },
  // Varatti prices from the previous anaadiecofutures.com shop.
  "varatti-1kg": { name: "Varatti — 1 kg", price: 150, maxPerOrder: 20 },
  "varatti-5kg": { name: "Varatti — 5 kg", price: 700, maxPerOrder: 20 },
  "varatti-10kg": { name: "Varatti — 10 kg", price: 1300, maxPerOrder: 20 },
};

/** Shipping and COD fee as published on the previous site's checkout. */
export const commerce = {
  currency: "INR",
  shippingFee: 80,
  freeShippingFrom: 1000,
  codFee: 50,
  maxLinesPerOrder: 20,
};

export interface PricedLine {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface Quote {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  codFee: number;
  total: number;
  /** True when some items have no published price yet. */
  hasUnpricedItems: boolean;
}

/** Prices a bag. Unknown slugs are dropped; quantities are clamped. */
export function quote(items: { slug: string; quantity: number }[]): Quote {
  const seen = new Set<string>();
  const lines: PricedLine[] = [];
  for (const item of items.slice(0, commerce.maxLinesPerOrder)) {
    const entry = Object.prototype.hasOwnProperty.call(priceList, item.slug) ? priceList[item.slug] : undefined;
    if (!entry || seen.has(item.slug) || !Number.isFinite(item.quantity)) continue;
    seen.add(item.slug);
    const quantity = Math.max(1, Math.min(entry.maxPerOrder, Math.floor(item.quantity)));
    lines.push({
      slug: item.slug,
      name: entry.name,
      quantity,
      unitPrice: entry.price,
      lineTotal: entry.price === null ? null : entry.price * quantity,
    });
  }
  const subtotal = lines.reduce((sum, l) => sum + (l.lineTotal ?? 0), 0);
  const hasUnpricedItems = lines.some((l) => l.unitPrice === null);
  const shipping = lines.length === 0 || subtotal >= commerce.freeShippingFrom ? 0 : commerce.shippingFee;
  const codFee = lines.length === 0 ? 0 : commerce.codFee;
  return { lines, subtotal, shipping, codFee, total: subtotal + shipping + codFee, hasUnpricedItems };
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
