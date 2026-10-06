import type { Metadata } from "next";

import { ThreadKolamCircuit } from "@/components/art/ThreadKolamCircuit";
import { Collage } from "@/components/Collage";
import { FeatureCard } from "@/components/FeatureCard";
import { MissionPanel } from "@/components/MissionPanel";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { home } from "@/lib/content/home";

export const metadata: Metadata = {
  title: { absolute: "Anaadi Ecofutures | Energy & Handloom Textiles" },
  description:
    "Anaadi Ecofutures brings together gobar-based energy initiatives and Anaadi Vastras handloom cotton, silk-cotton and silk — from the energy we use to the fabrics we wear.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const { hero, purpose, mission } = home;
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        primary={hero.primary}
        secondary={hero.secondary}
        media={<Collage main={hero.images.main} overlap={hero.images.overlap} />}
      />

      <ThreadKolamCircuit variant="divider" reveal />

      <section id="purpose" aria-labelledby="purpose-title" className="container-site scroll-mt-6 py-14 md:py-20">
        <SectionHeading
          id="purpose-title"
          eyebrow={purpose.eyebrow}
          title={purpose.title}
          body={purpose.body}
          align="center"
        />
        <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-2 md:gap-6 lg:gap-8">
          {purpose.cards.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <MissionPanel {...mission} />
    </>
  );
}
