import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeInOut, springFirm } from "../../motion";

export type LinePoint = { label: string; value: number };

export type LineChartProps = {
  data: LinePoint[];
  /** A faint comparison series (last period), drawn in grey. */
  compare?: number[];
  height?: number;
  format?: (v: number) => string;
  title: string;
  className?: string;
};

/** A line that draws itself in once in view, with a scrubbing readout. */
export function LineChart({ data, compare, height = 200, format = String, title, className }: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const all = [...data.map((d) => d.value), ...(compare ?? [])];
  const max = Math.max(...all) * 1.1;
  const min = Math.min(0, ...all);
  const W = 100, H = 100;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");

  const onMove = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const i = Math.round(((clientX - r.left) / r.width) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  const last = useRef(data.length - 1);
  const wasHidden = useRef(true);
  const shown = hover ?? last.current;
  const jump = wasHidden.current && hover != null;
  useEffect(() => {
    if (hover != null) last.current = hover;
    wasHidden.current = hover == null;
  });
  const readout = data[hover ?? data.length - 1];
  return (
    <figure className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3" aria-live="polite">
        <span className="text-[13px] text-muted">{readout.label}</span>
        <span className="tabular text-sm font-medium text-ink">{format(readout.value)}</span>
      </div>
      <div
        ref={box}
        className="relative touch-pan-y"
        style={{ height }}
        tabIndex={0}
        role="img"
        aria-label={`${title}. ${data.map((d) => `${d.label} ${format(d.value)}`).join(", ")}`}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setHover((h) => Math.min(data.length - 1, (h ?? -1) + 1));
          if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? data.length) - 1));
        }}
        onBlur={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1={0} x2={W} y1={H * t} y2={H * t} className="stroke-line" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
          <line x1={0} x2={W} y1={H} y2={H} className="stroke-line-strong" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          {compare && (
            <motion.path
              d={path(compare)}
              fill="none"
              className="stroke-line-strong"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
          )}
        </svg>
        {/* The main line is revealed by a wipe, not by dashes: dash lengths go wrong with a non-scaling stroke. */}
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
          <path
            d={path(data.map((d) => d.value))}
            fill="none"
            className="stroke-accent"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </motion.svg>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{ x: `${(shown / (data.length - 1)) * 100}%`, opacity: hover == null ? 0 : 1 }}
          transition={{ x: jump ? { duration: 0 } : springFirm, opacity: { duration: 0.15 } }}
        >
          <span className="absolute inset-y-0 left-0 w-px bg-line-strong" />
          <motion.span
            className="absolute inset-0"
            initial={false}
            animate={{ y: `${(y(data[shown].value) / H) * 100}%` }}
            transition={jump ? { duration: 0 } : springFirm}
          >
            <span className="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface" />
          </motion.span>
        </motion.div>
      </div>
      <div className="flex justify-between text-[11px] text-muted" aria-hidden>
        {data.map((d, i) =>
          i % Math.ceil((data.length - 1) / 4) === 0 || i === data.length - 1 ? <span key={d.label} className="whitespace-nowrap">{d.label}</span> : null,
        )}
      </div>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
