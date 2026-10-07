"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Field, FormAlert } from "@/components/forms/Field";
import { getProduct } from "@/lib/catalog";
import { callable, errorMessage } from "@/lib/firebase";
import { REFERRAL_SOURCES, type DeliveryDetails } from "@/lib/types";
import { INDIAN_STATES, parseDelivery, type FieldErrors } from "@/lib/validation";

import { QuoteTotals } from "./BagView";
import { useCart } from "./CartProvider";

const placeOrder = callable<
  {
    items: { slug: string; quantity: number }[];
    delivery: DeliveryDetails;
    notes: string;
    saveAddress: boolean;
    referral?: { source: string; detail?: string };
  },
  { id: string }
>("placeOrder");

export function CheckoutForm({ saved, fallbackName, fallbackPhone }: {
  saved?: DeliveryDetails;
  fallbackName: string;
  fallbackPhone: string;
}) {
  const { items, ready } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [e, setFieldErrors] = useState<FieldErrors>({});
  const [referralSource, setReferralSource] = useState("");
  const v = (k: keyof DeliveryDetails | "notes") => (k === "notes" ? "" : (saved?.[k] ?? ""));

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
    <form
      className="grid gap-12 lg:grid-cols-12"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
        // Same validation the placeOrder function runs, for instant feedback.
        const { data: delivery, errors } = parseDelivery(values);
        setFieldErrors(errors);
        if (!delivery) {
          setError("Please check the highlighted fields.");
          return;
        }
        setError(undefined);
        setPending(true);
        try {
          const { id } = await placeOrder({
            items: valid,
            delivery,
            notes: values.notes ?? "",
            saveAddress: values.saveAddress === "on",
            ...(values.referralSource
              ? {
                  referral: {
                    source: values.referralSource,
                    ...(values.referralDetail?.trim() ? { detail: values.referralDetail.trim() } : {}),
                  },
                }
              : {}),
          });
          router.push(`/account/order?id=${encodeURIComponent(id)}&placed=1`);
        } catch (err) {
          const details = (err as { details?: { fieldErrors?: FieldErrors } }).details;
          if (details?.fieldErrors) setFieldErrors(details.fieldErrors);
          setError(errorMessage(err));
          setPending(false);
        }
      }}
    >
      <fieldset className="space-y-5 lg:col-span-7">
        <legend className="font-display text-3xl text-forest">Delivery details</legend>
        <FormAlert message={error} />
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
        <Field label="How did you hear about us?" name="referralSource" optional>
          {({ id }) => (
            <select
              id={id}
              name="referralSource"
              className="field-input"
              value={referralSource}
              onChange={(ev) => setReferralSource(ev.target.value)}
            >
              <option value="">Choose…</option>
              {REFERRAL_SOURCES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          )}
        </Field>
        {referralSource && (
          <Field
            label={referralSource === "Other" ? "Please tell us where" : "Anything to add?"}
            name="referralDetail"
            optional
            maxLength={120}
            placeholder={referralSource === "Friend or family" ? "e.g. their name" : undefined}
          />
        )}
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
