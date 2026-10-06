import type { Metadata } from "next";

import { AdminClient } from "./AdminClient";

export const metadata: Metadata = { title: "Manage orders", robots: { index: false, follow: false } };

export default function AdminOrdersPage() {
  return (
    <section className="container-site py-12 md:py-20">
      <p className="eyebrow eyebrow-rule">Admin</p>
      <h1 className="text-page mt-5">Orders</h1>
      <div className="mt-6">
        <AdminClient />
      </div>
    </section>
  );
}
