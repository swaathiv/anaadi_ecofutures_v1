"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { nav } from "@/lib/content/site";

const linkBase =
  "relative inline-flex min-h-11 items-center font-label text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-forest transition-colors hover:text-brand";

function isActive(match: string | null, pathname: string) {
  if (!match) return false;
  return match === "/" ? pathname === "/" : pathname === match || pathname.startsWith(`${match}/`);
}

export function SiteHeader({ logo }: { logo: React.ReactNode }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onResize = () => window.matchMedia("(min-width: 1024px)").matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const bagLabel = ready && count > 0 ? `Bag (${count})` : "Bag";
  const bagAria = ready && count > 0 ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag, empty";

  const links = nav.map((item) => {
    const active = isActive(item.match, pathname);
    return { ...item, active };
  });

  return (
    <header className="container-site">
      <div className="flex items-center justify-between gap-6 border-b border-hairline py-3 md:py-4">
        {logo}

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {links.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`${linkBase} ${
                    item.active
                      ? "after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-6 after:bg-brand"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li aria-hidden="true" className="h-5 w-px bg-hairline" />
            <li>
              <Link
                href="/account"
                aria-current={pathname.startsWith("/account") ? "page" : undefined}
                className={linkBase}
              >
                Account
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                aria-label={bagAria}
                aria-current={pathname === "/cart" ? "page" : undefined}
                className={linkBase}
              >
                {bagLabel}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/cart" aria-label={bagAria} className={`${linkBase} px-2`}>
            {bagLabel}
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center gap-3 border border-forest px-3 font-label text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-forest"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform ${
                  open ? "top-1.5 rotate-45" : "top-0.5"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform ${
                  open ? "top-1.5 -rotate-45" : "top-2.5"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id={menuId}
        ref={panelRef}
        hidden={!open}
        className="border-b border-hairline pb-4 lg:hidden"
      >
        <nav aria-label="Main (mobile)">
          <ul className="flex flex-col">
            {[...links, { label: "Account", href: "/account", active: pathname.startsWith("/account") }].map(
              (item) => (
                <li key={item.label} className="border-b border-hairline/60 last:border-b-0">
                  <Link
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-12 items-center justify-between font-label text-base font-semibold uppercase tracking-[0.14em] ${
                      item.active ? "text-brand" : "text-forest"
                    }`}
                  >
                    {item.label}
                    {item.active && <span aria-hidden="true" className="h-0.5 w-6 bg-brand" />}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
