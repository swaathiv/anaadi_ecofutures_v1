import Image from "next/image";

import type { SiteImage } from "@/lib/content/images";

/**
 * Editorial two-image collage, using the approved mockup's proportions
 * (436 × 494): a main image at the top left with a second image behind it at
 * the lower right. The proportions are fixed at every width, so the part of
 * the second image that sits behind the first is always hidden. The homepage
 * fabric image relies on this: its top-left corner is not usable.
 */
export function Collage({ main, overlap }: { main: SiteImage; overlap: SiteImage }) {
  return (
    <div className="relative aspect-[436/494] w-full">
      <div className="absolute right-0 bottom-0 h-[67.8%] w-[67.4%] border border-brand">
        <Image
          src={overlap.src}
          alt={overlap.alt}
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 1024px) 30vw, 60vw"
          className="object-cover"
          style={{ objectPosition: overlap.focus }}
        />
      </div>
      <div className="absolute top-0 left-0 z-10 h-[76.5%] w-[73.4%] border border-brand bg-paper p-1">
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
  );
}
