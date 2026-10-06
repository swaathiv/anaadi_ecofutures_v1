import type { Metadata } from "next";
import Image from "next/image";

import { AddToBag } from "@/components/cart/AddToBag";
import { CrossLink } from "@/components/CrossLink";
import { PageHero } from "@/components/PageHero";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SectionHeading } from "@/components/SectionHeading";
import { ArrowUpRight } from "@/components/ui/Icons";
import { commerce, formatINR, varatti } from "@/lib/catalog";
import { energy } from "@/lib/content/energy";
import { mailto } from "@/lib/content/site";

export const metadata: Metadata = {
  title: { absolute: "Gobar-based Energy | Anaadi Ecofutures" },
  description:
    "Anaadi Ecofutures explores the energy potential of gobar (cow dung): biogas, chula and boiler systems, research into gobar-based biofuels and materials, consultancy and workshops.",
  alternates: { canonical: "/energy" },
};

export default function EnergyPage() {
  const { hero, figures, challenge, approach, process, why, journey, research, initiatives, consultancy, products } =
    energy;
  const consult = mailto(consultancy.cta.subject);

  return (
    <>
      <PageHero
        size="page"
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        primary={hero.cta}
        media={
          <figure className="mx-auto max-w-[34rem] lg:mr-0">
            <div className="relative aspect-[5/4] border border-brand bg-paper p-1">
              <div className="relative h-full w-full">
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  fill
                  priority
                  sizes="(min-width: 640px) 544px, 100vw"
                  className="object-cover"
                  style={{ objectPosition: hero.image.focus }}
                />
              </div>
            </div>
            {hero.image.temporary && (
              <figcaption className="mt-3 text-[0.8125rem] text-muted">Illustrative imagery.</figcaption>
            )}
          </figure>
        }
      />

      <section aria-label="Anaadi Ecofutures in figures" className="container-site">
        <dl className="grid border-y border-hairline sm:grid-cols-3">
          {figures.map((fig) => (
            <div
              key={fig.label}
              className="flex flex-col-reverse gap-1 border-hairline py-6 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-0"
            >
              <dt className="text-[0.9375rem] text-muted">{fig.label}</dt>
              <dd className="font-display text-[clamp(2.25rem,1.8rem+1.4vw,3.25rem)] leading-none text-forest">
                {fig.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="challenge-title" className="container-site py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow eyebrow-rule">{challenge.eyebrow}</p>
            <h2 id="challenge-title" className="text-section mt-5">
              {challenge.title}
            </h2>
          </div>
          <p className="text-lede text-ink lg:col-span-6 lg:col-start-7 lg:pt-12">{challenge.body}</p>
        </div>
      </section>

      <section id="approach" aria-labelledby="approach-title" className="scroll-mt-6 bg-surface">
        <div className="container-site py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow eyebrow-rule">{approach.eyebrow}</p>
              <h2 id="approach-title" className="text-section mt-5 max-w-[14ch]">
                {approach.title}
              </h2>
            </div>
            <div className="space-y-5 text-ink lg:col-span-6 lg:col-start-7 lg:pt-12">
              {approach.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <dl className="mt-14 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {approach.facets.map((f) => (
              <div key={f.label} className="bg-surface p-6 md:p-8">
                <dt className="eyebrow">{f.label}</dt>
                <dd className="mt-3 text-ink">{f.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="process-title" className="container-site py-16 md:py-24">
        <SectionHeading id="process-title" eyebrow={process.eyebrow} title={process.title} />
        <div className="mt-12">
          <ProcessSteps steps={process.steps} />
        </div>
      </section>

      <section aria-labelledby="why-title" className="container-site pb-16 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow eyebrow-rule">{why.eyebrow}</p>
            <h2 id="why-title" className="text-section mt-5">
              {why.title}
            </h2>
          </div>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {why.points.map((p) => (
              <div key={p.title} className="border-t border-hairline pt-5">
                <dt className="font-display text-2xl text-forest">{p.title}</dt>
                <dd className="mt-2 text-ink">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {initiatives.length > 0 && (
        <section aria-labelledby="initiatives-title" className="container-site pb-16 md:pb-24">
          <SectionHeading id="initiatives-title" eyebrow="Initiatives" title="Current initiatives." />
          <ul className="mt-10 grid gap-8 md:grid-cols-2">
            {initiatives.map((item) => (
              <li key={item.title} className="border-t border-hairline pt-5">
                {item.status && <p className="eyebrow">{item.status}</p>}
                <h3 className="text-card mt-2">{item.title}</h3>
                <p className="mt-3 text-ink">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="journey-title" className="border-y border-hairline bg-sage/50">
        <div className="container-site py-16 md:py-24">
          <SectionHeading id="journey-title" eyebrow={journey.eyebrow} title={journey.title} />
          <ol className="mt-12 grid gap-0 md:grid-cols-2 lg:grid-cols-3">
            {journey.milestones.map((m) => (
              <li key={m.year} className="border-t border-forest/40 py-6 md:pr-10">
                <p className="font-label text-lg font-semibold tracking-[0.1em] text-brand">{m.year}</p>
                <h3 className="mt-1 font-display text-2xl">{m.title}</h3>
                <p className="mt-2 text-ink">{m.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 max-w-2xl border-l-2 border-brand pl-6">
            <h3 className="font-display text-2xl">{journey.ahead.title}</h3>
            <p className="mt-2 text-ink">{journey.ahead.body}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="research-title" className="container-site py-16 md:py-24">
        <SectionHeading id="research-title" eyebrow={research.eyebrow} title={research.title} body={research.body} />
        <ul className="mt-12 border-t border-hairline">
          {research.streams.map((s) => (
            <li
              key={s.title}
              className="grid gap-2 border-b border-hairline py-6 md:grid-cols-12 md:items-baseline md:gap-8"
            >
              <p className="eyebrow md:col-span-2">{s.area}</p>
              <h3 className="font-display text-2xl md:col-span-4">{s.title}</h3>
              <p className="text-ink md:col-span-6">{s.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="consultancy-title" className="bg-surface">
        <div className="container-site py-16 md:py-24">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading id="consultancy-title" eyebrow={consultancy.eyebrow} title={consultancy.title} />
            {consult && (
              <a href={consult} className="btn btn-primary self-start md:self-auto">
                {consultancy.cta.label}
                <ArrowUpRight />
                <span className="sr-only">(opens your email app)</span>
              </a>
            )}
          </div>
          <ol className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {consultancy.services.map((s, i) => (
              <li key={s.title} className="border-t border-hairline pt-5">
                <p className="font-label text-sm font-semibold tracking-[0.14em] text-muted">0{i + 1}</p>
                <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
                <p className="mt-2 text-ink">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="varatti" aria-labelledby="products-title" className="container-site py-16 md:py-24">
        <SectionHeading id="products-title" eyebrow={products.eyebrow} title={products.title} body={products.body} />
        <ul className="mt-12 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
          {varatti.map((p) => (
            <li key={p.slug} className="flex flex-col bg-paper p-6 md:p-8">
              <h3 className="font-display text-2xl">{p.name}</h3>
              <p className="mt-2 flex-1 text-ink">{p.description}</p>
              {p.details && (
                <p className="mt-4 text-sm text-muted">{p.details.join(" · ")}</p>
              )}
              <p className="mt-5 font-display text-3xl text-forest">
                {p.price !== undefined ? formatINR(p.price) : "Price on request"}
              </p>
              <div className="mt-5">
                <AddToBag slug={p.slug} name={p.name} max={p.maxPerOrder} withQuantity variant="secondary" />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Cash on delivery only. Free shipping on orders of {formatINR(commerce.freeShippingFrom)} or more; otherwise{" "}
          {formatINR(commerce.shippingFee)}. A cash-on-delivery fee of {formatINR(commerce.codFee)} applies.
        </p>
      </section>

      <CrossLink title={energy.crossLink.title} cta={energy.crossLink.cta} art="energy" />
    </>
  );
}
