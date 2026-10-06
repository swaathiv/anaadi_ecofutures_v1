import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight } from "@/components/ui/Icons";
import { fabricLabels, formatINR, type Product } from "@/lib/catalog";

/**
 * Reusable collection grid. Accepts real product data; optional fields
 * (fabric, price, availability) render only when supplied.
 */
export function FabricCollection({ products }: { products: Product[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
      {products.map((p, i) => {
        const [main, detail] = p.images;
        return (
          <li key={p.slug} className="group relative flex flex-col">
            <div className="relative aspect-[4/5] overflow-hidden border border-hairline bg-surface">
              {main && (
                <Image
                  src={main.src}
                  alt={main.alt}
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 46vw, 100vw"
                  className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                  style={{ objectPosition: main.focus }}
                  loading={i < 2 ? "eager" : "lazy"}
                />
              )}
              {detail && (
                <Image
                  src={detail.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 23vw, 46vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </div>
            <p className="eyebrow mt-5">{p.fabric ? fabricLabels[p.fabric] : "Anaadi Vastras"}</p>
            <h3 className="mt-2 font-display text-2xl leading-tight">
              <Link href={`/vastras/${p.slug}`} className="after:absolute after:inset-0">
                {p.name}
              </Link>
            </h3>
            {p.colour && <p className="mt-2 text-[0.9375rem] text-muted">{p.colour}</p>}
            <p className="mt-3 text-[0.9375rem] text-forest">
              {p.price !== undefined ? formatINR(p.price) : "Price confirmed before dispatch"}
            </p>
            {p.availability && <p className="text-sm text-muted">{p.availability}</p>}
            <span aria-hidden="true" className="mt-4 inline-flex items-center gap-2 font-label text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand">
              View saree <ArrowUpRight />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
