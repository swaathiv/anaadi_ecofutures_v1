"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { quote } from "@/lib/catalog";
import { getCurrentUser, isAdmin } from "@/lib/server/auth";
import { write } from "@/lib/server/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { parseDelivery, type FieldErrors } from "@/lib/validation";

export interface CheckoutState {
  error?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
}

const ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function orderId() {
  const bytes = randomBytes(8);
  let id = "";
  for (const b of bytes) id += ID_ALPHABET[b % ID_ALPHABET.length];
  return `AE-${id.slice(0, 4)}-${id.slice(4)}`;
}

function parseCart(raw: unknown) {
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.slug === "string" && Number.isFinite(i.quantity))
      .slice(0, 50)
      .map((i) => ({ slug: String(i.slug), quantity: Number(i.quantity) }));
  } catch {
    return [];
  }
}

export async function placeOrder(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/checkout");

  const values = Object.fromEntries(
    ["name", "phone", "line1", "line2", "landmark", "city", "state", "pincode", "notes"].map((k) => [
      k,
      String(form.get(k) ?? ""),
    ]),
  );
  const { data: delivery, errors } = parseDelivery(form);
  if (!delivery) return { fieldErrors: errors, values, error: "Please check the highlighted fields." };

  const priced = quote(parseCart(form.get("cart")));
  if (priced.lines.length === 0) return { error: "Your bag is empty.", values };

  const notes = String(form.get("notes") ?? "").trim().slice(0, 500) || undefined;
  const saveAddress = form.get("saveAddress") === "on";
  const now = new Date().toISOString();
  const id = orderId();

  await write((db) => {
    db.orders.push({
      id,
      userId: user.id,
      email: user.email,
      lines: priced.lines,
      delivery,
      notes,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      codFee: priced.codFee,
      total: priced.total,
      hasUnpricedItems: priced.hasUnpricedItems,
      paymentMethod: "cod",
      status: "placed",
      history: [{ status: "placed", at: now }],
      createdAt: now,
    });
    if (saveAddress) {
      const u = db.users.find((x) => x.id === user.id);
      if (u) u.address = delivery;
    }
  });

  redirect(`/account/orders/${id}?placed=1`);
}

export async function cancelOrder(form: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  const id = String(form.get("orderId") ?? "");
  await write((db) => {
    const order = db.orders.find((o) => o.id === id && o.userId === user.id);
    // Customers may cancel only before the order is confirmed.
    if (order && order.status === "placed") {
      order.status = "cancelled";
      order.history.push({ status: "cancelled", at: new Date().toISOString(), note: "Cancelled by customer" });
    }
  });
  revalidatePath(`/account/orders/${id}`);
}

export async function updateOrderStatus(form: FormData) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) redirect("/account");
  const id = String(form.get("orderId") ?? "");
  const status = String(form.get("status") ?? "") as OrderStatus;
  const note = String(form.get("note") ?? "").trim().slice(0, 300) || undefined;
  if (!ORDER_STATUSES.includes(status)) return;
  await write((db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order) return;
    if (order.status === status && !note) return;
    order.status = status;
    order.history.push({ status, at: new Date().toISOString(), note });
  });
  revalidatePath("/admin/orders");
}
