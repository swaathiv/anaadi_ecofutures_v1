import { buildBand, type Band, type BandOptions } from "./geometry";

/**
 * Signature brand artwork: cotton-like threads become a sikku-kolam lattice,
 * which straightens into circuit traces ending in open pads.
 *
 * Purely decorative: every variant is aria-hidden and non-interactive.
 */

type Variant = "divider" | "panel" | "vastras" | "energy";

interface Props {
  variant?: Variant;
  className?: string;
  /** One-time left-to-right reveal (disabled under prefers-reduced-motion). */
  reveal?: boolean;
}

const STROKE = {
  strand: "var(--brand-green)",
  /** The logo's yellow, woven in as the second strand. */
  accent: "var(--logo-yellow)",
  fibre: "var(--thread-sage)",
  dot: "var(--forest-ink)",
  trail: "var(--hairline)",
};

/** Strand 1 is drawn in the logo yellow so the two strands visibly interweave. */
const ACCENT_STRAND = 1;

function BandShape({
  band,
  weight = 1.25,
  trailTo,
  muted = false,
}: {
  band: Band;
  weight?: number;
  trailTo?: number;
  muted?: boolean;
}) {
  const colour = (strand: number) =>
    muted ? STROKE.fibre : strand === ACCENT_STRAND ? STROKE.accent : STROKE.strand;
  // Yellow reads lighter on ivory, so its line is slightly heavier.
  const width = (strand: number) => (!muted && strand === ACCENT_STRAND ? weight * 1.2 : weight);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {band.fibres.map((d, i) => (
        <path key={`f${i}`} d={d} stroke={STROKE.fibre} strokeWidth={weight * 0.6} />
      ))}
      {band.accentFibres.map((d, i) => (
        <path key={`g${i}`} d={d} stroke={muted ? STROKE.fibre : STROKE.accent} strokeWidth={weight * 0.7} />
      ))}
      {trailTo !== undefined && (
        <path d={`M ${band.trailStart[0]} ${band.trailStart[1]} H ${trailTo}`} stroke={STROKE.trail} strokeWidth={1} />
      )}
      {band.traces.map((t, i) => (
        <path key={`t${i}`} d={t.d} stroke={colour(t.strand)} strokeWidth={width(t.strand)} />
      ))}
      {/* Green strand first, yellow on top: at crossings the yellow passes over. */}
      {band.strands.map((d, i) => (
        <path key={`s${i}`} d={d} stroke={colour(i)} strokeWidth={width(i)} />
      ))}
      {band.dots.map(([x, y], i) => (
        <circle key={`d${i}`} cx={x} cy={y} r={weight * 1.25} fill={muted ? STROKE.fibre : STROKE.dot} stroke="none" />
      ))}
      {band.pads.map(({ at: [x, y], strand }, i) => (
        <circle
          key={`p${i}`}
          cx={x}
          cy={y}
          r={weight * 3}
          fill="var(--paper)"
          stroke={muted ? STROKE.fibre : strand === ACCENT_STRAND ? STROKE.accent : STROKE.strand}
          strokeWidth={width(strand)}
        />
      ))}
    </g>
  );
}

const svgProps = {
  "aria-hidden": true,
  focusable: "false" as const,
  role: "presentation",
  xmlns: "http://www.w3.org/2000/svg",
};

const band = (opts: BandOptions) => buildBand(opts);

/* Bands are computed once at module load: the artwork is static. */
const dividerDesktop = band({ threadLength: 120, turns: 7, circuitLength: 290, seed: 3 });
const dividerMobile = band({ threadLength: 56, turns: 3, circuitLength: 170, seed: 5, branches: true });
const panelMain = band({ threadLength: 90, turns: 5, circuitLength: 260, seed: 7 });
const panelEcho = band({ threadLength: 140, turns: 6, circuitLength: 260, seed: 11, branches: false });
const panelMobile = band({ threadLength: 70, turns: 4, circuitLength: 150, seed: 13 });
const vastrasBand = band({ threadLength: 260, turns: 9, circuitLength: 110, seed: 17, branches: false });
const vastrasMobile = band({ threadLength: 110, turns: 4, circuitLength: 70, seed: 19, branches: false });
const energyBand = band({ threadLength: 90, turns: 4, circuitLength: 420, seed: 23 });
const energyMobile = band({ threadLength: 50, turns: 3, circuitLength: 190, seed: 29 });

/**
 * A slim strip at native scale; the trail rule carries on to the edge.
 *
 * `reveal` adds a one-time wipe from left to right with a soft leading edge,
 * so the threads appear first, then the kolam, then the circuit. Without
 * animation (reduced motion, no CSS) the mask rests fully open.
 */
function Strip({
  b,
  id,
  className,
  mirror = false,
  reveal,
}: {
  b: Band;
  id: string;
  className?: string;
  mirror?: boolean;
  reveal?: boolean;
}) {
  const W = 2400;
  const H = 96;
  const maskId = `${id}-mask`;
  const edgeId = `${id}-edge`;
  return (
    <svg
      {...svgProps}
      className={`${className ?? ""} block h-24 w-full`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={mirror ? "xMaxYMid slice" : "xMinYMid slice"}
    >
      {reveal && (
        <defs>
          <linearGradient id={edgeId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <g className="tkc-wipe">
              <rect x={-W - 300} y="0" width={W + 300} height={H} fill="#fff" />
              <rect x="0" y="0" width="300" height={H} fill={`url(#${edgeId})`} />
            </g>
          </mask>
        </defs>
      )}
      <g mask={reveal ? `url(#${maskId})` : undefined}>
        <g transform={mirror ? `translate(${W} 0) scale(-1 1)` : undefined}>
          <BandShape band={b} trailTo={W} />
        </g>
      </g>
    </svg>
  );
}

export function ThreadKolamCircuit({ variant = "divider", className = "", reveal = false }: Props) {
  if (variant === "divider") {
    return (
      <div className={`pointer-events-none select-none ${className}`}>
        <Strip id="tkc-divider-d" b={dividerDesktop} className="hidden md:block" reveal={reveal} />
        <Strip id="tkc-divider-m" b={dividerMobile} className="md:hidden" reveal={reveal} />
      </div>
    );
  }

  if (variant === "vastras") {
    return (
      <div className={`pointer-events-none select-none ${className}`}>
        <Strip id="tkc-vastras-d" b={vastrasBand} className="hidden md:block" />
        <Strip id="tkc-vastras-m" b={vastrasMobile} className="md:hidden" />
      </div>
    );
  }

  if (variant === "energy") {
    // Mirrored: circuits enter from the left and soften into kolam and threads.
    return (
      <div className={`pointer-events-none select-none ${className}`}>
        <Strip id="tkc-energy-d" b={energyBand} className="hidden md:block" mirror />
        <Strip id="tkc-energy-m" b={energyMobile} className="md:hidden" mirror />
      </div>
    );
  }

  // Panel: a larger composition, cropped by the panel's right and lower edges.
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg
        {...svgProps}
        className="hidden h-full w-full md:block"
        viewBox="0 0 640 360"
        preserveAspectRatio="xMinYMid slice"
      >
        <g transform="translate(0 70) scale(1.45)">
          <BandShape band={panelMain} weight={0.95} />
        </g>
        <g transform="translate(70 214) scale(1.1)" opacity={0.75}>
          <BandShape band={panelEcho} weight={1} muted />
        </g>
      </svg>
      <svg {...svgProps} className="block h-full w-full md:hidden" viewBox="0 0 360 120" preserveAspectRatio="xMaxYMid meet">
        <g transform="translate(0 12)">
          <BandShape band={panelMobile} />
        </g>
      </svg>
    </div>
  );
}
