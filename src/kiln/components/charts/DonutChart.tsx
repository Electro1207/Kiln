import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeInOut, fade } from "../../motion";
import { SwapText } from "../shared/Anchored";

export type DonutSegment = { label: string; value: number };

/** Text used by DonutChart. Pass a partial via `labels` to translate or reword. */
export interface DonutChartLabels {
  /** Centre text when nothing is hovered and no `centreLabel` is given. */
  total: string;
}
export const donutChartLabels: DonutChartLabels = { total: "Total" };

export type DonutChartProps = {
  data: DonutSegment[];
  title: string;
  /** Centre text when nothing is hovered. Defaults to the total. */
  centreLabel?: ReactNode;
  format?: (v: number) => string;
  size?: number;
  thickness?: number;
  className?: string;
  /** Override any UI text. Merged over `donutChartLabels`. */
  labels?: Partial<DonutChartLabels>;
};

/** Accent at four strengths: one hue, ordered by size, never a rainbow. */
const STRENGTH = [1, 0.66, 0.42, 0.24, 0.14];
const GAP_DEG = 1.6;

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0.toFixed(3)} ${y0.toFixed(3)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(3)} ${y1.toFixed(3)}`;
}

/**
 * A ring of parts of a whole. Segments draw in one after another. The hovered
 * segment comes from the pointer's angle around the centre, so the gaps between
 * segments belong to a segment too and nothing flickers.
 */
export function DonutChart({ data, title, centreLabel, format = String, size = 200, thickness = 22, className, labels }: DonutChartProps) {
  const l = { ...donutChartLabels, ...labels };
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const order = [...data.keys()].sort((a, b) => data[b].value - data[a].value);
  const strength = (i: number) => STRENGTH[Math.min(order.indexOf(i), STRENGTH.length - 1)];
  const c = 50, r = 50 - (thickness / size) * 50;
  const sw = (thickness / size) * 100;

  const segs = data.map((d, i) => {
    const before = data.slice(0, i).reduce((s, x) => s + x.value, 0);
    const a0 = (before / total) * 360;
    const a1 = ((before + d.value) / total) * 360;
    return { ...d, i, a0, a1 };
  });

  const pick = (clientX: number, clientY: number) => {
    const b = svg.current?.getBoundingClientRect();
    if (!b) return;
    const dx = clientX - (b.left + b.width / 2), dy = clientY - (b.top + b.height / 2);
    const dist = Math.hypot(dx, dy) / (b.width / 2);
    if (dist > 1.04 || dist < (r - sw / 2) / 50 - 0.06) {
      setHover(null);
      return;
    }
    const ang = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    const s = segs.find((g) => ang >= g.a0 && ang < g.a1);
    setHover(s ? s.i : null);
  };

  const cur = hover != null ? data[hover] : null;
  return (
    <figure className={cn("flex flex-col items-center gap-5 sm:flex-row sm:gap-8", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          ref={svg}
          viewBox="0 0 100 100"
          className="size-full touch-none"
          role="img"
          aria-label={`${title}. ${data.map((d) => `${d.label} ${format(d.value)}`).join(", ")}`}
          onPointerMove={(e) => pick(e.clientX, e.clientY)}
          onPointerLeave={() => setHover(null)}
        >
          <circle cx={c} cy={c} r={r} fill="none" className="stroke-active" strokeWidth={sw} />
          {segs.map((g) => {
            const gap = segs.length > 1 ? GAP_DEG / 2 : 0;
            return (
              <motion.path
                key={g.label}
                d={arc(c, c, r, g.a0 + gap, g.a1 - gap)}
                fill="none"
                className="stroke-accent transition-opacity duration-200"
                strokeWidth={sw}
                style={{ opacity: hover == null || hover === g.i ? strength(g.i) : strength(g.i) * 0.35 }}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 * ((g.a1 - g.a0) / 360) + 0.25, ease: easeInOut, delay: (g.a0 / 360) * 0.9 }}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div className="flex flex-col items-center" style={{ maxWidth: size - thickness * 2 - 16 }}>
            <SwapText value={cur ? cur.label : "total"} className="text-xs text-muted">
              {cur ? cur.label : centreLabel ?? l.total}
            </SwapText>
            <SwapText value={cur ? `v${hover}` : "t"} className="tabular text-2xl font-medium text-ink">
              {format(cur ? cur.value : total)}
            </SwapText>
          </div>
        </div>
      </div>
      <ul className="flex min-w-0 flex-col gap-0.5 self-stretch sm:self-center" onPointerLeave={() => setHover(null)} aria-label="Legend">
        {data.map((d, i) => (
          <li key={d.label}>
            <button
              type="button"
              className={cn(
                "flex h-8 w-full items-center gap-2.5 rounded-control px-2 text-left text-sm transition-colors duration-200",
                hover === i ? "bg-raised" : "",
              )}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${d.label}: ${format(d.value)}, ${Math.round((d.value / total) * 100)}%`}
            >
              <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-accent" style={{ opacity: strength(i) }} />
              <span className="min-w-0 flex-1 truncate text-ink">{d.label}</span>
              <motion.span
                aria-hidden
                className="tabular text-muted"
                initial={false}
                animate={{ opacity: hover == null || hover === i ? 1 : 0.5 }}
                transition={fade}
              >
                {Math.round((d.value / total) * 100)}%
              </motion.span>
            </button>
          </li>
        ))}
      </ul>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
