"use client";

import Link from "next/link";
import { useActionState } from "react";

import { placeOrder, type CheckoutState } from "@/app/actions/orders";
import { Field, FormAlert } from "@/components/forms/Field";
import { getProduct } from "@/lib/catalog";
import type { DeliveryDetails } from "@/lib/types";
import { INDIAN_STATES } from "@/lib/validation";

import { QuoteTotals } from "./BagView";
import { useCart } from "./CartProvider";

export function CheckoutForm({ saved, fallbackName, fallbackPhone }: {
  saved?: DeliveryDetails;
  fallbackName: string;
  fallbackPhone: string;
}) {
  const { items, ready } = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const e = state.fieldErrors ?? {};
  const v = (k: keyof DeliveryDetails | "notes") =>
    state.values?.[k] ?? (k === "notes" ? "" : (saved?.[k] ?? ""));

  if (!ready) return <p className="text-muted">Loading your bag…</p>;
  const valid = items.filter((i) => getProduct(i.slug));
  if (valid.length === 0) {
    return (
      <p className="text-ink">
        Your bag is empty.{" "}
        <Link href="/vastras" className="link-quiet">
          Browse the collection
        </Link>
        .
      </p>
    );
  }

  return (
    // Keyed on returned values: React resets forms after an action, and a
    // <select> would otherwise lose its value. Remounting reapplies defaults.
    <form key={JSON.stringify(state.values ?? {})} action={action} className="grid gap-12 lg:grid-cols-12" noValidate>
      <input type="hidden" name="cart" value={JSON.stringify(valid)} />
      <fieldset className="space-y-5 lg:col-span-7">
        <legend className="font-display text-3xl text-forest">Delivery details</legend>
        <FormAlert message={state.error} />
        <Field label="Recipient’s full name" name="name" autoComplete="name" defaultValue={v("name") || fallbackName} error={e.name} />
        <Field
          label="Mobile number"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          hint="We call this number to confirm the order and arrange delivery."
          defaultValue={v("phone") || fallbackPhone}
          error={e.phone}
        />
        <Field label="House, building, street" name="line1" autoComplete="address-line1" defaultValue={v("line1")} error={e.line1} />
        <Field label="Area, locality" name="line2" optional autoComplete="address-line2" defaultValue={v("line2")} error={e.line2} />
        <Field label="Landmark" name="landmark" optional defaultValue={v("landmark")} error={e.landmark} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Town or city" name="city" autoComplete="address-level2" defaultValue={v("city")} error={e.city} />
          <Field
            label="PIN code"
            name="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            defaultValue={v("pincode")}
            error={e.pincode}
          />
        </div>
        <Field label="State or union territory" name="state" error={e.state}>
          {({ id, describedBy, invalid }) => (
            <select
              id={id}
              name="state"
              className="field-input"
              defaultValue={v("state")}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              required
            >
              <option value="">Choose…</option>
              {INDIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Delivery note" name="notes" optional error={e.notes}>
          {({ id }) => (
            <textarea id={id} name="notes" rows={3} maxLength={500} className="field-input" defaultValue={v("notes")} />
          )}
        </Field>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="saveAddress" defaultChecked className="h-5 w-5 accent-[var(--brand-green)]" />
          <span>Save this address to my account</span>
        </label>
      </fieldset>

      <aside className="lg:col-span-5">
        <div className="border border-hairline bg-surface p-6 lg:sticky lg:top-6">
          <h2 className="font-display text-2xl">Your order</h2>
          <ul className="mt-4 space-y-2 text-[0.9375rem]">
            {valid.map((i) => (
              <li key={i.slug} className="flex justify-between gap-4">
                <span>{getProduct(i.slug)!.name}</span>
                <span className="text-muted">× {i.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-hairline pt-4">
            <QuoteTotals items={valid} />
          </div>
          <fieldset className="mt-6">
            <legend className="eyebrow">Payment</legend>
            <label className="mt-3 flex items-start gap-3 border border-brand bg-paper p-4">
              <input type="radio" name="payment" value="cod" defaultChecked className="mt-1 h-4 w-4 accent-[var(--brand-green)]" />
              <span>
                <span className="block font-medium text-forest">Cash on delivery</span>
                <span className="block text-sm text-muted">Pay when your order arrives. No online payment is taken.</span>
              </span>
            </label>
          </fieldset>
          <button type="submit" className="btn btn-primary mt-6 w-full" disabled={pending}>
            {pending ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 text-sm text-muted">
            You can follow this order from{" "}
            <Link href="/account" className="link-quiet">
              your account
            </Link>
            .
          </p>
        </div>
      </aside>
    </form>
  );
}
