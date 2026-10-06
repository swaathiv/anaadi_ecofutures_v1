import Link from "next/link";

import { ArrowRight } from "@/components/ui/Icons";

interface Cta {
  label: string;
  href: string;
}

/** Asymmetric hero: copy on the left (5 cols), media on the right (7 cols). */
export function PageHero({
  eyebrow,
  title,
  lede,
  primary,
  secondary,
  media,
  size = "hero",
}: {
  eyebrow: string;
  title: string;
  lede: string;
  primary?: Cta;
  secondary?: Cta;
  media: React.ReactNode;
  size?: "hero" | "page";
}) {
  return (
    <section className="container-site pt-10 pb-12 md:pt-16 md:pb-16 lg:pt-14">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6 xl:col-span-5">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className={`${size === "hero" ? "text-hero" : "text-page"} mt-5 max-w-[12ch]`}>{title}</h1>
          <p className="text-lede mt-6 max-w-[26ch] text-ink">{lede}</p>
          {(primary || secondary) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-5">
              {primary && (
                <Link href={primary.href} className="btn btn-primary">
                  {primary.label}
                  <ArrowRight />
                </Link>
              )}
              {secondary && (
                <Link href={secondary.href} className="btn btn-secondary">
                  {secondary.label}
                  <ArrowRight />
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="mx-auto w-full max-w-[36rem] lg:col-span-6 lg:max-w-none lg:pl-4 xl:col-span-7 xl:pl-12">{media}</div>
      </div>
    </section>
  );
}
