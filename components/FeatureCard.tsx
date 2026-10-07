import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight } from "@/components/ui/Icons";
import type { SiteImage } from "@/lib/content/images";

/** Image above a pale-sage text panel; the whole card is one link target via the CTA. */
export function FeatureCard({
  eyebrow,
  title,
  body,
  cta,
  image,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  image: SiteImage;
}) {
  return (
    <article className="group relative flex flex-col border border-hairline bg-sage/60">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-hairline">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 46vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          style={{ objectPosition: image.focus }}
        />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="eyebrow eyebrow-rule">{eyebrow}</p>
        <h3 className="text-card mt-5">{title}</h3>
        <p className="mt-3 text-ink">{body}</p>
        <div className="mt-8">
          <Link href={cta.href} className="btn btn-secondary after:absolute after:inset-0">
            {cta.label}
            <ArrowUpRight />
          </Link>
        </div>
      </div>
    </article>
  );
}
