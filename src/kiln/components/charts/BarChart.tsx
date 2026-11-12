import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";

export type BarDatum = { label: string; value: number };

export type BarChartProps = {
  data: BarDatum[];
  /** Index of the bar to draw in the accent (the current period). Defaults to the last. */
  highlight?: number;
  height?: number;
  format?: (v: number) => string;
  /** What the chart shows, read by screen readers. */
  title: string;
  className?: string;
};

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

/**
 * Bars grow from the baseline once in view. One hue: the highlighted bar.
 * The hovered bar comes from the pointer's position over the whole plot,
 * so moving between bars never flickers.
 */
export function BarChart({ data, highlight, height = 200, format = String, title, className }: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const plot = useRef<HTMLDivElement>(null);
  const hi = highlight ?? data.length - 1;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.5, 1];
  const pick = (clientX: number) => {
    const r = plot.current?.getBoundingClientRect();
    if (!r) return;
    const i = Math.floor(((clientX - r.left) / r.width) * data.length);
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };
  return (
    <figure className={cn("relative flex w-full flex-col gap-2", className)}>
      <div className="relative flex" style={{ height }}>
        <div className="tabular relative w-10 shrink-0 text-[11px] text-muted" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-2 -translate-y-1/2 leading-none" style={{ top: `${(1 - t) * 100}%` }}>
              {format(max * t)}
            </span>
          ))}
        </div>
        <div
          ref={plot}
          className="relative flex-1 touch-pan-y"
          onPointerMove={(e) => pick(e.clientX)}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <span key={t} aria-hidden className={cn("absolute inset-x-0 h-px", t === 0 ? "bg-line-strong" : "bg-line")} style={{ top: `calc(${(1 - t) * 100}% - ${t === 0 ? 1 : 0}px)` }} />
          ))}
          <div className="absolute inset-0 flex" role="list" aria-label={title}>
            {data.map((d, i) => {
              const pct = (d.value / max) * 100;
              return (
                <div key={d.label} role="listitem" className="relative flex h-full flex-1 items-end justify-center">
                  {/* The bar slides up inside a clipped slot, so its rounded top never squashes. */}
                  <motion.span
                    aria-hidden
                    className="block w-[62%] overflow-hidden rounded-t-[4px]"
                    style={{ height: `${pct}%` }}
                    initial="hidden"
                    whileInView="shown"
                    viewport={{ once: true }}
                  >
                    <motion.span
                      className={cn(
                        "block size-full transition-opacity duration-200",
                        i === hi ? "bg-accent" : "bg-line-strong",
                        hover != null && hover !== i && "opacity-50",
                      )}
                      variants={{ hidden: { y: "101%" }, shown: { y: "0%", transition: { ...springFirm, delay: i * 0.035 } } }}
                    />
                  </motion.span>
                  <button
                    type="button"
                    className="absolute inset-0 rounded-[4px] outline-offset-0"
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    aria-label={`${d.label}: ${format(d.value)}`}
                  />
                  <AnimatePresence>
                    {hover === i && (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: fade }}
                        transition={springFirm}
                        className="tabular pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-control bg-ink px-2 py-1 text-xs leading-4 text-surface shadow-float"
                        style={{ bottom: `calc(${pct}% + 8px)` }}
                      >
                        {format(d.value)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex pl-10 text-[11px] text-muted" aria-hidden>
        {data.map((d, i) => (
          <span key={d.label} className={cn("flex-1 truncate text-center", i === hi && "font-medium text-ink")}>
            {d.label}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
