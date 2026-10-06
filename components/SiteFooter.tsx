import Link from "next/link";

import { footerNav, site } from "@/lib/content/site";

export function SiteFooter({ logo }: { logo: React.ReactNode }) {
  return (
    <footer className="container-site pb-10">
      <div className="flex flex-col gap-8 border-t border-hairline pt-8 md:flex-row md:items-center md:justify-between">
        {logo}
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-1">
            {footerNav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center font-label text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-forest hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mt-6 text-sm text-muted">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </footer>
  );
}
