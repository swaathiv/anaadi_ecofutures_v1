import Image from "next/image";
import Link from "next/link";

import { images } from "@/lib/content/images";

/** The original Ecofutures logo, unaltered (padding trimmed only). */
export function Logo({ size = "md", priority = false }: { size?: "sm" | "md"; priority?: boolean }) {
  const height = size === "sm" ? "h-12" : "h-12 md:h-[3.75rem]";
  return (
    <Link href="/" className="inline-block shrink-0" aria-label="Anaadi Ecofutures — home">
      <Image
        src={images.logo.src}
        alt=""
        priority={priority}
        sizes="120px"
        className={`${height} w-auto`}
      />
    </Link>
  );
}
