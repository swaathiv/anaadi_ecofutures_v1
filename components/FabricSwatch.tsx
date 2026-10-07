/**
 * Thread-study illustration used in place of a fabric photograph until
 * fabric-specific photography is supplied: a field of fine, slightly
 * irregular threads, denser for finer cloth, with one gold border thread.
 * Decorative only.
 */
export function FabricSwatch({ weave }: { weave: "plain" | "fine" | "satin" }) {
  const count = weave === "plain" ? 9 : weave === "fine" ? 15 : 11;
  const wave = weave === "satin" ? 5 : weave === "fine" ? 1.5 : 2.5;
  const top = 34;
  const bottom = 128;
  const step = (bottom - top) / (count - 1);
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 240 180"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <rect width="240" height="180" fill="var(--sage)" opacity="0.5" />
      <g fill="none" strokeLinecap="round">
        {Array.from({ length: count }, (_, i) => {
          const y = top + i * step;
          // Deterministic small irregularity per thread.
          const a = (((i * 37) % 11) / 11 - 0.5) * wave;
          const b = (((i * 53) % 7) / 7 - 0.5) * wave;
          return (
            <path
              key={i}
              d={`M -4 ${y} C 60 ${y + a} 120 ${y - b} 180 ${y + b / 2} S 236 ${y + a / 2} 244 ${y}`}
              stroke={i % 4 === 1 ? "var(--thread-sage)" : "var(--brand-green)"}
              strokeWidth={weave === "fine" ? 0.55 : 0.75}
              opacity={i % 4 === 1 ? 0.9 : 0.6}
            />
          );
        })}
      </g>
      <path d="M -4 148 C 80 147 160 149 244 148" stroke="var(--thread-gold)" strokeWidth="1.1" fill="none" />
      <path d="M -4 153 C 80 154 160 152 244 153" stroke="var(--logo-yellow)" strokeWidth="0.9" fill="none" />
    </svg>
  );
}
