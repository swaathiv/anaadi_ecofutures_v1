import type { Metadata } from "next";

import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { requireUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Delivery and payment", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  return (
    <section className="container-site py-12 md:py-20">
      <p className="eyebrow eyebrow-rule">Checkout</p>
      <h1 className="text-page mt-5">Delivery and payment</h1>
      <p className="mt-4 max-w-xl text-ink">
        Signed in as {user.email}. All orders are cash on delivery.
      </p>
      <div className="mt-10">
        <CheckoutForm saved={user.address} fallbackName={user.name} fallbackPhone={user.phone} />
      </div>
    </section>
  );
}
