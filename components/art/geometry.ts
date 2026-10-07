/**
 * Geometry for the thread → kolam → circuit artwork.
 *
 * One band runs left to right along y = cy:
 *   1. Threads: two main strands (each with a finer companion fibre and one
 *      antique-gold fibre) enter from the left, slightly irregular.
 *   2. Kolam: the same two strands zig-zag through a dot grid. At every
 *      turning point the strand crosses itself and loops around a dot, as in a
 *      sikku (kambi) kolam, so the strands interlace into a lattice.
 *   3. Transition: one softened arch with no loop, so the curves relax
 *      gradually instead of snapping straight.
 *   4. Circuit: the strands straighten into traces with 45° jogs and right
 *      angles, ending in open circular pads.
 *
 * Strand 0 and strand 1 can be drawn in different colours (green and the
 * logo yellow) so the interweaving reads; each circuit trace and pad records
 * which strand it grows from.
 *
 * Everything is returned as plain SVG path data so the band can be scaled,
 * mirrored, rotated or cropped by the caller.
 */

export type Point = readonly [number, number];

export interface BandOptions {
  /** Length of the thread section before the first kolam crossing. */
  threadLength: number;
  /** Number of kolam turning points (loops). Minimum 2. */
  turns: number;
  /** Length of the circuit section after the last kolam crossing. */
  circuitLength: number;
  /** Half period of the kolam zig-zag. */
  halfPeriod?: number;
  /** Distance from centre line to a turning apex. */
  amplitude?: number;
  /** Radius of each kolam loop. */
  loopRadius?: number;
  /** Centre line. */
  cy?: number;
  /** Draw the secondary circuit branches. */
  branches?: boolean;
  /** Small seed so different bands get slightly different fibres. */
  seed?: number;
}

export interface Band {
  /** The two continuous strands: thread → kolam → circuit trace. */
  strands: string[];
  /** Fine companion fibres in the thread section. */
  fibres: string[];
  /** Accent fibres in the thread section (drawn in the accent colour). */
  accentFibres: string[];
  /** Secondary circuit traces, tagged with the strand they branch from. */
  traces: { d: string; strand: number }[];
  /** Dot grid of the kolam. */
  dots: Point[];
  /** Open circuit terminals, tagged with the strand they end. */
  pads: { at: Point; strand: number }[];
  /** Where the central trace leaves the circuit (for a continuing rule). */
  trailStart: Point;
  /** Total width actually drawn (excluding any trail). */
  width: number;
}

const f = (n: number) => Number(n.toFixed(2));
const pt = ([x, y]: Point) => `${f(x)} ${f(y)}`;

/** Deterministic small jitter so threads look hand-spun, not mechanical. */
function jitter(seed: number) {
  let s = seed * 9301 + 49297;
  return (amount: number) => {
    s = (s * 9301 + 49297) % 233280;
    return (s / 233280 - 0.5) * 2 * amount;
  };
}

export function buildBand(options: BandOptions): Band {
  const {
    threadLength,
    turns,
    circuitLength,
    halfPeriod: a = 40,
    amplitude: h = 24,
    loopRadius: R = 7,
    cy = 48,
    branches = true,
    seed = 1,
  } = options;
  const j = jitter(seed);

  const n = Math.max(2, Math.round(turns));
  const slope = h / (a / 2);
  const norm = Math.hypot(1, slope);
  const x0 = threadLength + a / 2; // first turning point
  const turnX = (i: number) => x0 + i * a;
  const startCross: Point = [threadLength, cy];
  // After the last loop: one softened arch, then the circuit begins.
  const endCross: Point = [turnX(n) + a / 2, cy];
  // Arch control height chosen so it leaves and arrives at 45°, matching
  // the circuit's first jog.
  const archControl = a / 2;

  // Offset from apex to loop centre so both legs are tangent to the loop.
  const centreOffset = R * norm;

  /** Loop around the dot beyond turning point i, top (dir=-1) or bottom (dir=1). */
  function loop(i: number, dir: -1 | 1) {
    const x = turnX(i);
    const centre: Point = [x, cy + dir * (h + centreOffset)];
    // Incoming leg passes through (x - a/2, cy) with direction (1, dir*slope).
    const uIn: Point = [1 / norm, (dir * slope) / norm];
    const uOut: Point = [1 / norm, (-dir * slope) / norm];
    const qIn: Point = [x - a / 2, cy];
    const qOut: Point = [x + a / 2, cy];
    const project = (q: Point, u: Point): Point => {
      const t = (centre[0] - q[0]) * u[0] + (centre[1] - q[1]) * u[1];
      return [q[0] + t * u[0], q[1] + t * u[1]];
    };
    const t1 = project(qIn, uIn);
    const t2 = project(qOut, uOut);
    const sweep = dir === -1 ? 0 : 1;
    return {
      centre,
      d: `L ${pt(t1)} A ${f(R)} ${f(R)} 0 1 ${sweep} ${pt(t2)} L ${pt(qOut)}`,
    };
  }

  const dots: Point[] = [];
  const strands: string[] = [];
  const fibres: string[] = [];
  const accentFibres: string[] = [];
  const traces: { d: string; strand: number }[] = [];
  const pads: { at: Point; strand: number }[] = [];

  // Kolam dots inside each lens of the lattice.
  for (let i = 0; i < n; i++) dots.push([turnX(i), cy]);

  // Two strands. Strand 0 turns at the top first, strand 1 at the bottom.
  const endDirs: (-1 | 1)[] = [];
  for (const s of [0, 1] as const) {
    const firstDir: -1 | 1 = s === 0 ? -1 : 1;
    // Thread section: enters slightly off the centre line, wavers, then
    // arrives at the first crossing with the tangent of the first kolam leg.
    const side = firstDir;
    const p0: Point = [0, cy + side * (9 + j(1.5))];
    const mid: Point = [threadLength * 0.52, cy + side * (5 + j(1.5))];
    const c1: Point = [threadLength * 0.22, p0[1] - side * (4 + j(1.5))];
    const c2: Point = [threadLength * 0.36, mid[1] + side * 1.8];
    const k = Math.min(16, threadLength * 0.2);
    const c4: Point = [startCross[0] - k / norm, cy - (firstDir * slope * k) / norm];
    let d = `M ${pt(p0)} C ${pt(c1)} ${pt(c2)} ${pt(mid)} S ${pt(c4)} ${pt(startCross)}`;

    // Companion fibre: runs alongside, converges into the strand.
    const off = side * (2 + j(0.6));
    fibres.push(
      `M ${pt([0, p0[1] + off])} C ${pt([c1[0], c1[1] + off * 1.2])} ${pt([c2[0], c2[1] + off])} ${pt([
        mid[0],
        mid[1] + off * 0.8,
      ])} S ${pt([c4[0], c4[1] + off * 0.2])} ${pt(startCross)}`,
    );

    // Kolam section.
    let dir = firstDir;
    for (let i = 0; i < n; i++) {
      const l = loop(i, dir);
      dots.push(l.centre);
      d += ` ${l.d}`;
      dir = (dir * -1) as -1 | 1;
    }
    // Softened arch towards the next apex (no loop, no crossing), arriving
    // at the end crossing heading the other way at 45°.
    d += ` Q ${pt([turnX(n), cy + dir * archControl])} ${pt(endCross)}`;
    endDirs.push((dir * -1) as -1 | 1);
    strands.push(d);
  }

  // A single loose accent fibre in the thread section.
  if (threadLength > 50) {
    const g0: Point = [0, cy - 1 + j(1)];
    accentFibres.push(
      `M ${pt(g0)} C ${pt([threadLength * 0.25, cy - 5])} ${pt([threadLength * 0.45, cy + 3])} ${pt([
        threadLength * 0.68,
        cy - 2.5,
      ])}`,
    );
  }

  // Circuit section. The strand whose next direction is up (-1) becomes the
  // upper trace; the other the lower trace.
  const L = circuitLength;
  const [ex, ey] = endCross;
  const step = 12;
  const route = (pts: Point[]) => pts.map((p, i) => `${i ? "L" : "M"} ${pt(p)}`).join(" ");

  const upperMain: Point[] = [
    [ex + step, ey - step],
    [ex + L * 0.45, ey - step],
    [ex + L * 0.45 + step, ey - 2 * step],
    [ex + L * 0.75, ey - 2 * step],
  ];
  const lowerMain: Point[] = [
    [ex + step, ey + step],
    [ex + L * 0.34, ey + step],
    [ex + L * 0.34 + step, ey + 2 * step],
    [ex + L * 0.6, ey + 2 * step],
  ];

  endDirs.forEach((dir, s) => {
    const pts = dir === -1 ? upperMain : lowerMain;
    strands[s] += " " + pts.map((p) => `L ${pt(p)}`).join(" ");
  });
  const upper = endDirs.indexOf(-1);
  const lowerStrand = 1 - upper;
  pads.push(
    { at: upperMain[upperMain.length - 1], strand: upper },
    { at: lowerMain[lowerMain.length - 1], strand: lowerStrand },
  );

  // Central trace branching from the upper trace; it is the one that may
  // continue as a long rule (trail).
  const bx = ex + Math.max(L * 0.18, step * 2);
  const central: Point[] = [
    [bx, ey - step],
    [bx + step, ey],
    [ex + L, ey],
  ];
  traces.push({ d: route(central), strand: upper });
  const trailStart: Point = [ex + L, ey];

  if (branches) {
    const lx = ex + Math.max(L * 0.15, step * 1.5);
    const lower: Point[] = [
      [lx, ey + step],
      [lx + 2 * step, ey + 3 * step],
      [ex + L * 0.3 + 2 * step, ey + 3 * step],
    ];
    traces.push({ d: route(lower), strand: lowerStrand });
    pads.push({ at: lower[lower.length - 1], strand: lowerStrand });

    const ux = ex + L * 0.55;
    const up: Point[] = [
      [ux, ey - 2 * step],
      [ux + step, ey - 3 * step],
      [ex + L * 0.62 + step, ey - 3 * step],
    ];
    traces.push({ d: route(up), strand: upper });
    pads.push({ at: up[up.length - 1], strand: upper });
  }

  return {
    strands,
    fibres,
    accentFibres,
    traces,
    dots,
    pads,
    trailStart,
    width: ex + L,
  };
}
