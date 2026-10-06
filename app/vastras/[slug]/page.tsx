import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToBag } from "@/components/cart/AddToBag";
import { fabricLabels, formatINR, getProduct, sarees } from "@/lib/catalog";
import { mailto } from "@/lib/content/site";

export function generateStaticParams() {
  return sarees.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product || product.line !== "vastras") return {};
  return {
    title: { absolute: `${product.name} | Anaadi Vastras` },
    description: product.description,
    alternates: { canonical: `/vastras/${product.slug}` },
  };
}

export default async function SareePage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product || product.line !== "vastras") notFound();

  const facts: [string, string | undefined][] = [
    ["Fabric", product.fabric ? fabricLabels[product.fabric] : undefined],
    ["Colour", product.colour],
    ["Dimensions", product.dimensions],
    ["Fibre composition", product.fibreComposition],
    ["Care", product.care],
    ["Availability", product.availability],
  ];
  const known = facts.filter((f): f is [string, string] => Boolean(f[1]));
  const missing = facts.filter((f) => !f[1] && f[0] !== "Availability").map((f) => f[0].toLowerCase());
  const enquiry = mailto(`Anaadi Vastras enquiry: ${product.name}`);

  return (
    <article className="container-site py-10 md:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/vastras" className="link-quiet">
              Anaadi Vastras
            </Link>
            <span aria-hidden="true"> /</span>
          </li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="grid gap-4 self-start lg:col-span-7">
          {/* Shown at their natural proportions, exactly as photographed. */}
          {product.images.map((img, i) => (
            <div key={i} className="border border-hairline bg-surface">
              <Image
                src={img.src}
                alt={img.alt}
                priority={i === 0}
                sizes="(min-width: 1280px) 720px, (min-width: 1024px) 56vw, 100vw"
                className="block h-auto w-full"
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-6 lg:col-span-5 lg:self-start">
          <p className="eyebrow">Anaadi Vastras</p>
          <h1 className="text-page mt-4">{product.name}</h1>
          <p className="mt-6 text-ink">{product.description}</p>

          <p className="mt-6 font-display text-2xl text-forest">
            {product.price !== undefined ? formatINR(product.price) : "Price confirmed before dispatch"}
          </p>

          <div className="mt-6">
            <AddToBag slug={product.slug} name={product.name} max={product.maxPerOrder} />
          </div>

          <p className="text-sm text-muted">
            Cash on delivery. We confirm{" "}
            {product.price === undefined ? "the price, " : ""}
            {missing.length ? `${missing.join(", ")} ` : ""}and delivery with you before dispatch.
          </p>

          {product.details && (
            <ul className="mt-8 border-t border-hairline">
              {product.details.map((d) => (
                <li key={d} className="border-b border-hairline py-3 text-ink">
                  {d}
                </li>
              ))}
            </ul>
          )}

          {known.length > 0 && (
            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
              {known.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="eyebrow pt-1">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {enquiry && (
            <p className="mt-8 text-sm">
              <a href={enquiry} className="link-quiet">
                Ask about this saree
              </a>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
