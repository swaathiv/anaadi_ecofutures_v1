"use client";

import { useEffect } from "react";

import { useCart } from "./CartProvider";

/** Empties the bag once an order has been placed. */
export function ClearBagOnMount() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
