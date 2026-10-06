"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "./CartProvider";

export function AddToBag({
  slug,
  name,
  max,
  withQuantity = false,
  variant = "primary",
}: {
  slug: string;
  name: string;
  max: number;
  withQuantity?: boolean;
  variant?: "primary" | "secondary";
}) {
  const { add, items, ready } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const inBag = items.find((i) => i.slug === slug)?.quantity ?? 0;
  const atMax = inBag >= max;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        {withQuantity && max > 1 && (
          <label className="flex flex-col">
            <span className="field-label">Quantity</span>
            <select
              className="field-input w-24"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {Array.from({ length: Math.min(10, max) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          className={`btn ${variant === "primary" ? "btn-primary" : "btn-secondary"}`}
          disabled={!ready || atMax}
          onClick={() => {
            add(slug, quantity, max);
            setAdded(true);
          }}
        >
          {atMax ? "In your bag" : "Add to bag"}
          <span className="sr-only"> — {name}</span>
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-6 text-sm text-muted">
        {added && (
          <>
            Added to your bag.{" "}
            <Link href="/cart" className="link-quiet">
              View bag
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
