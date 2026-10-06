import Image from "next/image";

import type { SiteImage } from "@/lib/content/images";

/**
 * Editorial two-image collage from the approved mockup: a main image with a
 * second image overlapping behind it at the lower right. On small screens it
 * simplifies to the main image with a small offset detail.
 */
export function Collage({ main, overlap }: { main: SiteImage; overlap: SiteImage }) {
  const illustrative = main.temporary || overlap.temporary;
  return (
    <figure className="relative">
      <div className="relative aspect-[436/470] w-full">
        <div className="absolute right-0 bottom-0 h-[52%] w-[48%] border border-brand sm:h-[68%] sm:w-[66%]">
          <Image
            src={overlap.src}
            alt={overlap.alt}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 1024px) 30vw, 60vw"
            className="object-cover"
            style={{ objectPosition: overlap.focus }}
          />
        </div>
        <div className="absolute top-0 left-0 z-10 h-[80%] w-[78%] border border-brand bg-paper p-1 sm:h-[76%] sm:w-[72%]">
          <div className="relative h-full w-full">
            <Image
              src={main.src}
              alt={main.alt}
              fill
              priority
              sizes="(min-width: 1280px) 460px, (min-width: 1024px) 34vw, 78vw"
              className="object-cover"
              style={{ objectPosition: main.focus }}
            />
          </div>
        </div>
      </div>
      {illustrative && (
        <figcaption className="mt-3 text-[0.8125rem] text-muted">Illustrative imagery.</figcaption>
      )}
    </figure>
  );
}
