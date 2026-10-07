"use client";

import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { AddressBlock, formatDate, OrderSummary, StatusBadge } from "@/components/account/OrderParts";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { callable, errorMessage, firebase } from "@/lib/firebase";
import { ORDER_STATUSES, statusLabels, type AdminEntry, type Order, type OrderStatus } from "@/lib/types";
import { displayPhone } from "@/lib/validation";

const setAdmin = callable<{ identifier: string; action: "add" | "remove" }, { ok: true; uid: string }>("setAdmin");

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
  if (isAdmin) return <AdminTabs />;
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

function AdminTabs() {
  const [tab, setTab] = useState<"orders" | "admins">("orders");
  return (
    <>
      <div role="tablist" aria-label="Admin sections" className="mb-8 flex border-b border-hairline">
        {(
          [
            ["orders", "Orders"],
            ["admins", "Admins"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`admin-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`admin-panel-${key}`}
            onClick={() => setTab(key)}
            className={`-mb-px min-h-12 border-b-2 px-5 font-label text-sm font-semibold uppercase tracking-[0.14em] ${
              tab === key ? "border-brand text-forest" : "border-transparent text-muted hover:text-forest"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`admin-panel-${tab}`} aria-labelledby={`admin-tab-${tab}`}>
        {tab === "orders" ? <Orders /> : <Admins />}
      </div>
    </>
  );
}

/** Spreadsheet-friendly export of the orders currently shown. */
function downloadCsv(orders: Order[]) {
  const header = [
    "Order ID", "Placed (IST)", "Status", "Customer", "Account phone", "Account email",
    "Deliver to", "Delivery phone", "Address", "City", "State", "PIN",
    "Items", "Subtotal", "Shipping", "COD fee", "Total", "Prices to confirm",
    "Heard about us", "Heard about us (detail)", "Customer note", "Last update note",
  ];
  const ist = (iso: string) =>
    new Intl.DateTimeFormat("en-IN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(
      new Date(iso),
    );
  const rows = orders.map((o) => [
    o.id,
    ist(o.createdAt),
    statusLabels[o.status],
    o.customer.name,
    o.customer.phone ?? "",
    o.customer.email ?? "",
    o.delivery.name,
    o.delivery.phone,
    [o.delivery.line1, o.delivery.line2, o.delivery.landmark && `Near ${o.delivery.landmark}`].filter(Boolean).join(", "),
    o.delivery.city,
    o.delivery.state,
    o.delivery.pincode,
    o.lines.map((l) => `${l.name} x${l.quantity}`).join("; "),
    o.subtotal,
    o.shipping,
    o.codFee,
    o.total,
    o.hasUnpricedItems ? "Yes" : "No",
    o.referral?.source ?? "",
    o.referral?.detail ?? "",
    o.notes ?? "",
    [...o.history].reverse().find((h) => h.note)?.note ?? "",
  ]);
  // Quote every cell; neutralise leading =,+,-,@ so spreadsheets do not run formulas.
  const cell = (v: unknown) => {
    let t = String(v ?? "");
    if (/^[=+\-@]/.test(t)) t = `'${t}`;
    return `"${t.replace(/"/g, '""')}"`;
  };
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `anaadi-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Admins() {
  const { user, profile } = useAuth();
  const [admins, setAdmins] = useState<(AdminEntry & { uid: string })[] | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(
    () =>
      onSnapshot(
        collection(firebase().db, "admins"),
        (snap) => setAdmins(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as AdminEntry) }))),
        (e) => setMessage(errorMessage(e)),
      ),
    [],
  );

  async function run(action: "add" | "remove", id: string) {
    setBusy(true);
    setMessage(undefined);
    try {
      await setAdmin({ identifier: id, action });
      setMessage(action === "add" ? "Admin added." : "Admin removed.");
      if (action === "add") setIdentifier("");
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h2 className="font-display text-3xl">Current admins</h2>
        <p className="mt-2 text-muted">Admins can see every order, change its status and manage admins.</p>
        {!admins && <p className="mt-4 text-muted">Loading…</p>}
        <ul className="mt-6 border-t border-hairline">
          {admins?.map((raw) => {
            // The first admin is created by hand in the console with no
            // details; show the signed-in admin's own profile for that row.
            const a =
              raw.uid === user?.uid
                ? { ...raw, name: raw.name ?? profile?.name, email: raw.email ?? profile?.email, phone: raw.phone ?? profile?.phone }
                : raw;
            const contact = a.email ?? a.phone;
            return (
              <li key={a.uid} className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline py-4">
                <span>
                  <span className="block font-medium text-forest">
                    {a.name ?? contact ?? "Admin"}
                    {a.uid === user?.uid ? " (you)" : ""}
                  </span>
                  <span className="block text-sm text-muted">
                    {[a.email, a.phone && displayPhone(a.phone)].filter(Boolean).join(" · ") || `User ID ${a.uid}`}
                  </span>
                </span>
                {contact && a.uid !== user?.uid && (
                  <button
                    type="button"
                    className="min-h-11 text-sm text-brand underline underline-offset-4 hover:text-forest disabled:text-muted"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Remove admin access for ${a.name ?? contact}?`)) void run("remove", contact);
                    }}
                  >
                    Remove<span className="sr-only"> {a.name ?? contact}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <form
        className="space-y-4 lg:col-span-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (identifier.trim()) void run("add", identifier);
        }}
      >
        <h2 className="font-display text-3xl">Add an admin</h2>
        <p className="text-muted">
          They must have signed in to the website once. Enter the email or mobile number they signed in with.
        </p>
        <label className="block">
          <span className="field-label">Email or mobile number</span>
          <input
            className="field-input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy || !identifier.trim()}>
          {busy ? "Saving…" : "Add admin"}
        </button>
        {message && (
          <p role="status" className="text-sm text-muted">
            {message}
          </p>
        )}
      </form>
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
        <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!shown.length}
          onClick={() => downloadCsv(shown)}
        >
          Download CSV
        </button>
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
            {o.referral && (
              <p className="mt-2 text-sm text-muted">
                Heard about us: {o.referral.source}
                {o.referral.detail ? ` — ${o.referral.detail}` : ""}
              </p>
            )}
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
