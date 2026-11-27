import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";
import { ChartShell, patternStyle, rovingNext, summariseSeries, useChartA11y, chartA11yLabels, type ChartA11yLabels, type ChartA11yProps } from "./ChartA11y";

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
  /** Override the accessibility text (table button, summary). Merged over `chartA11yLabels`. */
  labels?: Partial<ChartA11yLabels>;
} & ChartA11yProps;

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
export function BarChart({ data, highlight, height = 200, format = String, title, className, labels, accessibilityFeatures, tableToggle }: BarChartProps) {
  const l = { ...chartA11yLabels, ...labels };
  const ca = useChartA11y({ accessibilityFeatures, tableToggle });
  // One-off entrances (draw, grow, fade in) are skipped under calm, reduced motion and no flashing.
  const still = ca.a11y.calm || ca.a11y.reduceMotion || ca.a11y.noFlashing;
  const [rove, setRove] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
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
    <ChartShell
      ca={ca}
      title={title}
      summary={summariseSeries(l, data.map((d) => d.label), data.map((d) => d.value), format)}
      table={{ caption: title, columns: [l.label, l.value], rows: data.map((d) => [d.label, format(d.value)]) }}
      labels={labels}
      className={className}
      figureClassName="w-full"
      bodyClassName="flex w-full flex-col gap-2"
    >
      <div className="relative flex" style={{ height }}>
        <div className="tabular relative w-10 shrink-0 text-[0.6875rem] text-muted" aria-hidden>
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
          <div className="absolute inset-0 flex" role="list" aria-label={`${title}. ${l.keysHint}`}>
            {data.map((d, i) => {
              const pct = (d.value / max) * 100;
              return (
                <div key={d.label} role="listitem" className="relative flex h-full flex-1 items-end justify-center">
                  {/* The bar slides up inside a clipped slot, so its rounded top never squashes. */}
                  <motion.span
                    aria-hidden
                    className="block w-[62%] overflow-hidden rounded-t-[4px]"
                    style={{ height: `${pct}%` }}
                    initial={still ? false : "hidden"}
                    whileInView="shown"
                    viewport={{ once: true }}
                  >
                    <motion.span
                      className={cn(
                        "block size-full transition-opacity duration-200",
                        i === hi ? (ca.colourSafe ? "" : "bg-accent") : "bg-line-strong",
                        hover != null && hover !== i && "opacity-50",
                      )}
                      style={i === hi && ca.colourSafe ? patternStyle(0) : undefined}
                      variants={{ hidden: { y: "101%" }, shown: { y: "0%", transition: { ...springFirm, delay: i * 0.035 } } }}
                    />
                  </motion.span>
                  <button
                    type="button"
                    ref={(el) => { buttons.current[i] = el; }}
                    className="absolute inset-0 rounded-[4px] outline-offset-0"
                    tabIndex={(rove ?? hi) === i ? 0 : -1}
                    onFocus={() => { setRove(i); setHover(i); }}
                    onBlur={() => setHover(null)}
                    onKeyDown={(e) => {
                      const n = rovingNext(e.key, i, data.length);
                      if (n == null) return;
                      e.preventDefault();
                      buttons.current[n]?.focus();
                    }}
                    aria-label={`${d.label}: ${format(d.value)}`}
                  />
                  <AnimatePresence>
                    {hover === i && (
                      <motion.span
                        initial={still ? false : { opacity: 0, y: 4 }}
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
      <div className="flex pl-10 text-[0.6875rem] text-muted" aria-hidden>
        {data.map((d, i) => (
          <span key={d.label} className={cn("flex-1 truncate text-center", i === hi && "font-medium text-ink")}>
            {d.label}
          </span>
        ))}
      </div>
    </ChartShell>
  );
}
