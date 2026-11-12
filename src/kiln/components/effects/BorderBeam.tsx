import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../cn";
import { useLoop } from "../shared/useLoop";

export type BorderBeamProps = {
  children: ReactNode;
  /** Corner radius of the card, px; the beam follows it exactly. */
  radius?: number;
  /** Seconds for one lap. */
  duration?: number;
  /** Share of the perimeter the bright segment covers, 0..1. */
  length?: number;
  /** Two segments on opposite sides. */
  twin?: boolean;
  className?: string;
};

/**
 * A short bright segment running round a card's border. It is a dash moving
 * along the card's own outline (no conic gradient), it follows the radius
 * exactly, and it pauses off-screen.
 */
export function BorderBeam({ children, radius = 16, duration = 7, length = 0.12, twin = true, className }: BorderBeamProps) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLoop(
    box,
    (el) =>
      Array.from(el.querySelectorAll<SVGRectElement>("[data-beam]")).map((r, i) =>
        r.animate([{ strokeDashoffset: -i * 0.5 }, { strokeDashoffset: -i * 0.5 - 1 }], {
          duration: duration * 1000,
          iterations: Infinity,
          easing: "linear",
        }),
      ),
    [size?.w, size?.h, duration, twin],
  );

  return (
    <div ref={box} className={cn("relative border border-line bg-surface", className)} style={{ borderRadius: radius }}>
      {children}
      {size && (
        <svg ref={svg} aria-hidden className="pointer-events-none absolute -inset-px overflow-visible" width={size.w} height={size.h} fill="none">
          {(twin ? [0, 1] : [0]).map((i) => (
            <rect
              key={i}
              data-beam
              x={0.75}
              y={0.75}
              width={size.w - 1.5}
              height={size.h - 1.5}
              rx={radius - 0.75}
              pathLength={1}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray={`${length} ${1 - length}`}
              strokeDashoffset={-i * 0.5}
              className="stroke-accent"
            />
          ))}
        </svg>
      )}
    </div>
  );
}
