import { formatINR } from "@/lib/catalog";
import { statusLabels, type Order, type OrderStatus } from "@/lib/types";

const TRACK: OrderStatus[] = ["placed", "confirmed", "shipped", "delivered"];

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(
    new Date(iso),
  );

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone =
    status === "cancelled"
      ? "border-error/50 text-error"
      : status === "delivered"
        ? "border-brand bg-brand text-paper"
        : "border-brand text-brand";
  return (
    <span className={`inline-flex items-center border px-2.5 py-1 font-label text-xs font-semibold uppercase tracking-[0.14em] ${tone}`}>
      {statusLabels[status]}
    </span>
  );
}

/** Progress track: text labels plus filled/open markers (not colour alone). */
export function OrderTrack({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return <p className="text-ink">This order was cancelled.</p>;
  }
  const reached = TRACK.indexOf(order.status);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
      {TRACK.map((s, i) => {
        const done = i <= reached;
        const when = order.history.findLast((h) => h.status === s)?.at;
        return (
          <li key={s} className="relative">
            <div className={`h-0.5 ${done ? "bg-brand" : "bg-hairline"}`} />
            <span
              aria-hidden="true"
              className={`absolute -top-[5px] left-0 h-3 w-3 rounded-full border ${
                done ? "border-brand bg-brand" : "border-hairline bg-paper"
              }`}
            />
            <p className={`mt-4 text-sm ${done ? "font-medium text-forest" : "text-muted"}`}>
              {statusLabels[s]}
              <span className="sr-only">{done ? " — completed" : " — not yet"}</span>
            </p>
            {done && when && <p className="text-xs text-muted">{formatDate(when)}</p>}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div>
      <ul className="border-t border-hairline">
        {order.lines.map((l) => (
          <li key={l.slug} className="flex justify-between gap-6 border-b border-hairline py-3">
            <span>
              {l.name} <span className="text-muted">× {l.quantity}</span>
            </span>
            <span className="shrink-0 text-forest">
              {l.lineTotal === null ? "To be confirmed" : formatINR(l.lineTotal)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 text-[0.9375rem]">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal{order.hasUnpricedItems ? " (priced items)" : ""}</dt>
          <dd>{formatINR(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Cash-on-delivery fee</dt>
          <dd>{formatINR(order.codFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-hairline pt-2 font-medium text-forest">
          <dt>{order.hasUnpricedItems ? "Amount so far" : "Pay on delivery"}</dt>
          <dd>{formatINR(order.total)}</dd>
        </div>
      </dl>
      {order.hasUnpricedItems && (
        <p className="mt-3 text-sm text-muted">
          Some items are priced on confirmation. We will confirm the final amount with you before dispatch.
        </p>
      )}
    </div>
  );
}

export function AddressBlock({ d }: { d: Order["delivery"] }) {
  return (
    <address className="not-italic text-ink">
      {d.name}
      <br />
      {d.line1}
      {d.line2 && (
        <>
          <br />
          {d.line2}
        </>
      )}
      {d.landmark && (
        <>
          <br />
          Near {d.landmark}
        </>
      )}
      <br />
      {d.city}, {d.state} {d.pincode}
      <br />
      Phone: {d.phone}
    </address>
  );
}
