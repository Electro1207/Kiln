import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeInOut, fade, springFirm } from "../../motion";

export type AreaSeries = { name: string; values: number[] };

export type AreaChartProps = {
  labels: string[];
  /** Bottom series first. The first series is the one the chart is about and gets full strength. */
  series: AreaSeries[];
  title: string;
  height?: number;
  format?: (v: number) => string;
  className?: string;
};

const STRENGTH = [0.9, 0.5, 0.26, 0.14];

/**
 * Stacked areas, revealed by a wipe. The cursor comes from the pointer over the
 * whole plot (or the arrow keys) and the readout lists every layer and the total.
 */
export function AreaChart({ labels, series, title, height = 220, format = String, className }: AreaChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const n = labels.length;
  const stacks = labels.map((_, i) => {
    let s = 0;
    return series.map((ser) => (s += ser.values[i]));
  });
  const max = Math.max(...stacks.map((s) => s[s.length - 1])) * 1.08;
  const W = 100, H = 100;
  const x = (i: number) => (i / (n - 1)) * W;
  const y = (v: number) => H - (v / max) * H;

  const area = (k: number) => {
    const top = stacks.map((s, i) => `${x(i).toFixed(2)},${y(s[k]).toFixed(2)}`);
    const bottom = stacks.map((s, i) => `${x(i).toFixed(2)},${y(k ? s[k - 1] : 0).toFixed(2)}`).reverse();
    return `M${top.join(" L")} L${bottom.join(" L")} Z`;
  };
  const line = (k: number) => stacks.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(s[k]).toFixed(2)}`).join(" ");

  const pick = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((clientX - r.left) / r.width) * (n - 1)))));
  };

  const last = useRef(n - 1);
  const wasHidden = useRef(true);
  const jump = wasHidden.current && hover != null;
  const at = hover ?? last.current;
  useEffect(() => {
    if (hover != null) last.current = hover;
    wasHidden.current = hover == null;
  });
  const idx = hover ?? n - 1;

  return (
    <figure className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" aria-live="polite">
        <span className="text-[13px] text-muted">{labels[idx]}</span>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          {[...series].reverse().map((s) => {
            const k = series.indexOf(s);
            return (
              <div key={s.name} className="flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-full bg-accent" style={{ opacity: STRENGTH[k] ?? 0.14 }} />
                <dt className="text-muted">{s.name}</dt>
                <dd className="tabular font-medium text-ink">{format(s.values[idx])}</dd>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5">
            <dt className="text-muted">Total</dt>
            <dd className="tabular font-medium text-ink">{format(stacks[idx][series.length - 1])}</dd>
          </div>
        </dl>
      </div>
      <div
        ref={box}
        className="relative touch-pan-y"
        style={{ height }}
        tabIndex={0}
        role="img"
        aria-label={title}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); setHover((h) => Math.min(n - 1, (h ?? -1) + 1)); }
          if (e.key === "ArrowLeft") { e.preventDefault(); setHover((h) => Math.max(0, (h ?? n) - 1)); }
        }}
        onBlur={() => setHover(null)}
      >
        {[0.25, 0.5, 0.75].map((t) => (
          <span key={t} aria-hidden className="absolute inset-x-0 h-px bg-line" style={{ top: `${t * 100}%` }} />
        ))}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line-strong" />
        <motion.svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          aria-hidden
          initial={{ clipPath: "inset(-8px 100% -8px -8px)" }}
          whileInView={{ clipPath: "inset(-8px -8px -8px -8px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: easeInOut }}
        >
          {series.map((s, k) => (
            <path key={s.name} d={area(k)} className="fill-accent" style={{ fillOpacity: (STRENGTH[k] ?? 0.14) * 0.55 }} />
          ))}
          {series.map((s, k) => (
            <path
              key={s.name + "-l"}
              d={line(k)}
              fill="none"
              className="stroke-accent"
              style={{ strokeOpacity: STRENGTH[k] ?? 0.14 }}
              strokeWidth={k === 0 ? 2 : 1.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </motion.svg>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{ x: `${(at / (n - 1)) * 100}%`, opacity: hover == null ? 0 : 1 }}
          transition={{ x: jump ? { duration: 0 } : springFirm, opacity: fade }}
        >
          <span className="absolute inset-y-0 left-0 w-px bg-ink/40" />
          {series.map((s, k) => (
            <motion.span
              key={s.name}
              className="absolute inset-0"
              initial={false}
              animate={{ y: `${(y(stacks[at][k]) / H) * 100}%` }}
              transition={jump ? { duration: 0 } : springFirm}
            >
              <span
                className="absolute left-0 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface"
                style={{ opacity: k === 0 ? 1 : 0.75 }}
              />
            </motion.span>
          ))}
        </motion.div>
      </div>
      <div className="flex justify-between text-[11px] text-muted" aria-hidden>
        {labels.map((l, i) => (i % Math.ceil((n - 1) / 4) === 0 || i === n - 1 ? <span key={l} className="whitespace-nowrap">{l}</span> : null))}
      </div>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
