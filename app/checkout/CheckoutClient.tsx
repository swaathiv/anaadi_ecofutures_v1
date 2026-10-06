"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { displayPhone } from "@/lib/validation";

export function CheckoutClient() {
  return (
    <RequireAuth>
      <Checkout />
    </RequireAuth>
  );
}

function Checkout() {
  const { profile } = useAuth();
  if (!profile) return null;
  return (
    <>
      <p className="mb-10 max-w-xl text-ink">
        Signed in as {profile.email ?? displayPhone(profile.phone)}. All orders are cash on delivery.
      </p>
      <CheckoutForm
        saved={profile.address}
        fallbackName={profile.name}
        fallbackPhone={profile.phone?.replace(/^\+91/, "") ?? ""}
      />
    </>
  );
}
