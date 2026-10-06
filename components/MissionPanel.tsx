import { ThreadKolamCircuit } from "@/components/art/ThreadKolamCircuit";

export function MissionPanel({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section aria-labelledby="mission-title" className="container-site">
      <div className="relative overflow-hidden bg-sage/60">
        <div className="relative z-10 px-6 py-12 md:max-w-[56%] md:px-10 md:py-16 lg:px-14 lg:py-20">
          <p className="eyebrow eyebrow-rule">{eyebrow}</p>
          <h2 id="mission-title" className="text-section mt-5 max-w-[14ch]">
            {title}
          </h2>
          <p className="text-lede mt-5 text-ink">{body}</p>
        </div>
        <ThreadKolamCircuit
          variant="panel"
          className="h-28 w-full md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[52%]"
        />
      </div>
    </section>
  );
}
