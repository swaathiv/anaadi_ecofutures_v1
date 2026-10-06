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
  /** One-time stroke reveal (disabled under prefers-reduced-motion). */
  reveal?: boolean;
}

const STROKE = {
  strand: "var(--brand-green)",
  fibre: "var(--thread-sage)",
  gold: "var(--thread-gold)",
  dot: "var(--forest-ink)",
  trail: "var(--hairline)",
};

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
  const strand = muted ? STROKE.fibre : STROKE.strand;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {band.fibres.map((d, i) => (
        <path key={`f${i}`} d={d} stroke={STROKE.fibre} strokeWidth={weight * 0.6} pathLength={1} />
      ))}
      {band.goldFibres.map((d, i) => (
        <path key={`g${i}`} d={d} stroke={STROKE.gold} strokeWidth={weight * 0.6} pathLength={1} />
      ))}
      {band.strands.map((d, i) => (
        <path key={`s${i}`} d={d} stroke={strand} strokeWidth={weight} pathLength={1} />
      ))}
      {band.traces.map((d, i) => (
        <path key={`t${i}`} d={d} stroke={strand} strokeWidth={weight} pathLength={1} />
      ))}
      {trailTo !== undefined && (
        <path
          d={`M ${band.trailStart[0]} ${band.trailStart[1]} H ${trailTo}`}
          stroke={STROKE.trail}
          strokeWidth={1}
          pathLength={1}
        />
      )}
      {band.dots.map(([x, y], i) => (
        <circle
          key={`d${i}`}
          className="tkc-dot"
          cx={x}
          cy={y}
          r={weight * 1.25}
          fill={muted ? STROKE.fibre : STROKE.dot}
          stroke="none"
        />
      ))}
      {band.pads.map(([x, y], i) => (
        <circle
          key={`p${i}`}
          cx={x}
          cy={y}
          r={weight * 3}
          fill="var(--paper)"
          stroke={STROKE.gold}
          strokeWidth={weight}
          pathLength={1}
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

/** A slim strip at native scale; the trail rule carries on to the edge. */
function Strip({
  b,
  className,
  mirror = false,
  reveal,
}: {
  b: Band;
  className?: string;
  mirror?: boolean;
  reveal?: boolean;
}) {
  const W = 2400;
  return (
    <svg
      {...svgProps}
      className={`${className ?? ""} ${reveal ? "tkc-reveal" : ""} block h-24 w-full`}
      viewBox={`0 0 ${W} 96`}
      preserveAspectRatio={mirror ? "xMaxYMid slice" : "xMinYMid slice"}
    >
      <g transform={mirror ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <BandShape band={b} trailTo={W} />
      </g>
    </svg>
  );
}

export function ThreadKolamCircuit({ variant = "divider", className = "", reveal = false }: Props) {
  if (variant === "divider") {
    return (
      <div className={`pointer-events-none select-none ${className}`}>
        <Strip b={dividerDesktop} className="hidden md:block" reveal={reveal} />
        <Strip b={dividerMobile} className="md:hidden" reveal={reveal} />
      </div>
    );
  }

  if (variant === "vastras") {
    return (
      <div className={`pointer-events-none select-none ${className}`}>
        <Strip b={vastrasBand} className="hidden md:block" />
        <Strip b={vastrasMobile} className="md:hidden" />
      </div>
    );
  }

  if (variant === "energy") {
    // Mirrored: circuits enter from the left and soften into kolam and threads.
    return (
      <div className={`pointer-events-none select-none ${className}`}>
        <Strip b={energyBand} className="hidden md:block" mirror />
        <Strip b={energyMobile} className="md:hidden" mirror />
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
