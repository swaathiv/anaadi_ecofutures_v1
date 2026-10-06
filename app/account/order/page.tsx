import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderClient } from "./OrderClient";

export const metadata: Metadata = { title: "Order", robots: { index: false } };

export default function OrderPage() {
  return (
    <section className="container-site py-12 md:py-20">
      <Suspense fallback={<p className="text-muted">Loading order…</p>}>
        <OrderClient />
      </Suspense>
    </section>
  );
}
