import type { Metadata } from "next";

import { BagView } from "@/components/cart/BagView";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <section className="container-site py-12 md:py-20">
      <p className="eyebrow eyebrow-rule">Your bag</p>
      <h1 className="text-page mt-5">Your bag</h1>
      <div className="mt-10">
        <BagView />
      </div>
    </section>
  );
}
