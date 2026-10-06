import type { Metadata } from "next";

import { AccountClient } from "./AccountClient";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <section className="container-site py-12 md:py-20">
      <AccountClient />
    </section>
  );
}
