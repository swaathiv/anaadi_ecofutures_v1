import type { Metadata } from "next";

import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = { title: "Delivery and payment", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <section className="container-site py-12 md:py-20">
      <p className="eyebrow eyebrow-rule">Checkout</p>
      <h1 className="text-page mt-5">Delivery and payment</h1>
      <div className="mt-6">
        <CheckoutClient />
      </div>
    </section>
  );
}
