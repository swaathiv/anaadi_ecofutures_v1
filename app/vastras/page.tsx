import type { Metadata } from "next";
import Link from "next/link";

import { Collage } from "@/components/Collage";
import { CrossLink } from "@/components/CrossLink";
import { FabricCollection } from "@/components/FabricCollection";
import { FabricSwatch } from "@/components/FabricSwatch";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { ArrowUpRight } from "@/components/ui/Icons";
import { sarees } from "@/lib/catalog";
import { mailto } from "@/lib/content/site";
import { vastras } from "@/lib/content/vastras";

export const metadata: Metadata = {
  title: { absolute: "Anaadi Vastras | Handloom Cotton, Silk-Cotton & Silk" },
  description:
    "Anaadi Vastras: handloom cotton, silk-cotton and silk sarees from Anaadi Ecofutures, with attention to texture, craft and the way we wear. Cash on delivery.",
  alternates: { canonical: "/vastras" },
};

export default function VastrasPage() {
  const { hero, fabrics, collection, care, crossLink } = vastras;
  const enquiry = mailto("Anaadi Vastras enquiry");

  return (
    <>
      <PageHero
        size="page"
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        primary={hero.cta}
        media={<Collage main={hero.images.main} overlap={hero.images.overlap} />}
      />

      <section id="fabrics" aria-labelledby="fabrics-title" className="scroll-mt-6 border-t border-hairline">
        <div className="container-site py-16 md:py-24">
          <SectionHeading id="fabrics-title" eyebrow={fabrics.eyebrow} title={fabrics.title} />
          <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {fabrics.entries.map((entry, i) => (
              <li key={entry.id}>
                <div className="aspect-[4/3] overflow-hidden border border-hairline">
                  <FabricSwatch weave={entry.weave} />
                </div>
                <p className="mt-5 font-label text-sm font-semibold tracking-[0.14em] text-muted">
                  0{i + 1}
                </p>
                <h3 className="text-card mt-1">{entry.name}</h3>
                <p className="mt-3 max-w-sm text-ink">{entry.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="collection" aria-labelledby="collection-title" className="bg-surface">
        <div className="container-site py-16 md:py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              id="collection-title"
              eyebrow={collection.eyebrow}
              title={collection.title}
              body={collection.body}
            />
          </div>
          <div className="mt-12">
            <FabricCollection products={sarees} />
          </div>
        </div>
      </section>

      <section aria-labelledby="care-title" className="container-site py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow eyebrow-rule">{care.eyebrow}</p>
            <h2 id="care-title" className="text-section mt-5 max-w-[16ch]">
              {care.title}
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-12">
            <p className="text-lede text-ink">{care.body}</p>
            <p className="mt-6 text-muted">{care.note}</p>
            {enquiry && (
              <a href={enquiry} className="btn btn-secondary mt-8">
                Enquire about the collection
                <ArrowUpRight />
                <span className="sr-only">(opens your email app)</span>
              </a>
            )}
            <p className="mt-6 text-sm text-muted">
              Every order is cash on delivery.{" "}
              <Link href="/account" className="link-quiet">
                Track your orders
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <CrossLink title={crossLink.title} cta={crossLink.cta} art="vastras" />
    </>
  );
}
