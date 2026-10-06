import { ThreadKolamCircuit } from "@/components/art/ThreadKolamCircuit";

/** Narrow, quiet layout for account pages. */
export function AuthShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="container-site py-12 md:py-20">
        <div className="mx-auto max-w-xl">
          <p className="eyebrow eyebrow-rule">{eyebrow}</p>
          <h1 className="text-page mt-5">{title}</h1>
          {intro && <div className="mt-5 text-ink">{intro}</div>}
          <div className="mt-10">{children}</div>
        </div>
      </section>
      <ThreadKolamCircuit variant="divider" />
    </>
  );
}
