import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { cn } from "../../cn";
import { useLoop } from "../shared/useLoop";

export type AnimatedBeamProps = {
  /** The positioned element the beam is drawn inside (usually the diagram's root). */
  container: RefObject<HTMLElement | null>;
  from: RefObject<HTMLElement | null>;
  to: RefObject<HTMLElement | null>;
  /** How far the curve bows, px. Negative bows the other way. */
  curvature?: number;
  /** Run the pulse from `to` towards `from`. */
  reverse?: boolean;
  /** ms for one pulse to travel the path. */
  duration?: number;
  /** ms before the first pulse. */
  delay?: number;
  className?: string;
};

type Geo = { d: string; w: number; h: number };

/**
 * A curved connector between two elements, with a short light travelling along
 * it. The light is a dash moved along the path, so there is no gradient, and
 * it pauses while the diagram is off-screen.
 */
export function AnimatedBeam({ container, from, to, curvature = 0, reverse, duration = 2600, delay = 0, className }: AnimatedBeamProps) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const pulse = useRef<SVGPathElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const id = useId();

  useEffect(() => {
    const c = container.current, a = from.current, b = to.current;
    if (!c || !a || !b) return;
    const measure = () => {
      const cr = c.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const x1 = ar.left - cr.left + ar.width / 2, y1 = ar.top - cr.top + ar.height / 2;
      const x2 = br.left - cr.left + br.width / 2, y2 = br.top - cr.top + br.height / 2;
      const mx = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} Q ${mx} ${(y1 + y2) / 2 - curvature} ${x2} ${y2}`;
      setGeo({ d, w: cr.width, h: cr.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    ro.observe(a);
    ro.observe(b);
    return () => ro.disconnect();
  }, [container, from, to, curvature]);

  const SEG = 0.16;
  // The diagram (always mounted) decides visibility; the svg appears only after measuring.
  useLoop(
    container,
    () =>
      pulse.current && geo
        ? [
            pulse.current.animate(
              reverse
                ? [{ strokeDashoffset: -1 }, { strokeDashoffset: SEG }]
                : [{ strokeDashoffset: SEG }, { strokeDashoffset: -1 }],
              { duration, delay, iterations: Infinity, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
            ),
          ]
        : [],
    [geo?.d, reverse, duration, delay],
  );

  if (!geo) return null;
  return (
    <svg ref={svg} aria-hidden className={cn("pointer-events-none absolute left-0 top-0", className)} width={geo.w} height={geo.h} fill="none">
      <path id={id} d={geo.d} pathLength={1} strokeWidth={2} className="stroke-line-strong" strokeLinecap="round" />
      <path
        ref={pulse}
        d={geo.d}
        pathLength={1}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={`${SEG} 2`}
        strokeDashoffset={SEG}
        className="stroke-accent"
      />
    </svg>
  );
}
