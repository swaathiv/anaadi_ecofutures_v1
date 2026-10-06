import Link from "next/link";

import { ThreadKolamCircuit } from "@/components/art/ThreadKolamCircuit";
import { ArrowRight } from "@/components/ui/Icons";

/** Restrained closing link to the other expression of the brand. */
export function CrossLink({
  title,
  cta,
  art,
}: {
  title: string;
  cta: { label: string; href: string };
  art: "vastras" | "energy";
}) {
  return (
    <section aria-labelledby="crosslink-title" className="pt-16 md:pt-24">
      <ThreadKolamCircuit variant={art} />
      <div className="container-site mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <h2 id="crosslink-title" className="text-section max-w-[20ch]">
          {title}
        </h2>
        <Link href={cta.href} className="btn btn-primary self-start md:self-auto">
          {cta.label}
          <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
