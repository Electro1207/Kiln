import { useRef, useState } from "react";
import { motion } from "motion/react";
import { easeInOut, fade, springFirm } from "../../motion";
import { announce } from "../accessibility/announce";
import { ChartPatternDefs, ChartShell, chartA11yLabels, cvd, markerClip, markerShape, patternUrl, rovingNext, summariseSeries, useChartA11y, type ChartA11yLabels, type ChartA11yProps } from "./ChartA11y";

export type AreaSeries = { name: string; values: number[] };

export type AreaChartProps = {
  labels: string[];
  /** Bottom series first. The first series is the one the chart is about and gets full strength. */
  series: AreaSeries[];
  title: string;
  height?: number;
  format?: (v: number) => string;
  className?: string;
  /** Override the accessibility text (table button, summary). Merged over `chartA11yLabels`. */
  a11yLabels?: Partial<ChartA11yLabels>;
} & ChartA11yProps;

const STRENGTH = [0.9, 0.5, 0.26, 0.14];

/**
 * Stacked areas, revealed by a wipe. The cursor comes from the pointer over the
 * whole plot (or the arrow keys) and the readout lists every layer and the total.
 */
export function AreaChart({ labels, series, title, height = 220, format = String, className, a11yLabels, accessibilityFeatures, tableToggle }: AreaChartProps) {
  const l = { ...chartA11yLabels, ...a11yLabels };
  const ca = useChartA11y({ accessibilityFeatures, tableToggle });
  // One-off entrances (draw, grow, fade in) are skipped under calm, reduced motion and no flashing.
  const still = ca.a11y.calm || ca.a11y.reduceMotion || ca.a11y.noFlashing;
  const pid = `${ca.uid}-p`;
  // `at` is the last spot shown, so the marker fades out where it was; `jump` skips travel on re-entry.
  const [cursor, setCursor] = useState({ hover: null as number | null, at: labels.length - 1, jump: false });
  const { hover, at: lastAt, jump } = cursor;
  const setHover = (v: number | null | ((h: number | null) => number | null)) =>
    setCursor((s) => {
      const next = typeof v === "function" ? v(s.hover) : v;
      return next === s.hover ? s : { hover: next, at: next ?? s.at, jump: next != null && s.hover == null };
    });
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

  const at = lastAt;
  const idx = hover ?? n - 1;

  return (
    <ChartShell
      ca={ca}
      title={title}
      summary={summariseSeries(l, labels, stacks.map((s) => s[s.length - 1]), format).replace(/^/, `${series.length} layers. `)}
      table={{
        caption: title,
        columns: [l.label, ...series.map((s) => s.name), l.total],
        rows: labels.map((x, i) => [x, ...series.map((s) => format(s.values[i])), format(stacks[i][series.length - 1])]),
      }}
      labels={a11yLabels}
      className={className}
      figureClassName="w-full"
      bodyClassName="flex w-full flex-col gap-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[0.8125rem] text-muted">{labels[idx]}</span>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem]">
          {[...series].reverse().map((s) => {
            const k = series.indexOf(s);
            return (
              <div key={s.name} className="flex items-center gap-1.5">
                {ca.colourSafe ? (
                  <span aria-hidden className="inline-block size-2.5 shrink-0" style={{ clipPath: markerClip(markerShape(k)), backgroundColor: cvd(k) }} />
                ) : (
                  <span aria-hidden className="size-2 rounded-full bg-accent" style={{ opacity: STRENGTH[k] ?? 0.14 }} />
                )}
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
        role="group"
        aria-roledescription="chart"
        aria-label={`${title}. ${l.keysHint}`}
        onFocus={(e) => {
          if (e.target === e.currentTarget && e.currentTarget.matches(":focus-visible")) setHover((h) => h ?? n - 1);
        }}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          const next = rovingNext(e.key, hover ?? n - 1, n, { prev: ["ArrowLeft"], next: ["ArrowRight"] });
          if (next == null) return;
          e.preventDefault();
          setHover(next);
          announce(`${labels[next]}: ${series.map((s) => `${s.name} ${format(s.values[next])}`).join(", ")}, ${l.total} ${format(stacks[next][series.length - 1])}`);
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
          initial={still ? false : { clipPath: "inset(-8px 100% -8px -8px)" }}
          whileInView={{ clipPath: "inset(-8px -8px -8px -8px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: easeInOut }}
        >
          {ca.colourSafe && <ChartPatternDefs id={pid} size={4} />}
          {series.map((s, k) => (
            <path key={s.name} d={area(k)} className={ca.colourSafe ? undefined : "fill-accent"} style={ca.colourSafe ? { fill: patternUrl(pid, k), fillOpacity: 0.75 } : { fillOpacity: (STRENGTH[k] ?? 0.14) * 0.55 }} />
          ))}
          {series.map((s, k) => (
            <path
              key={s.name + "-l"}
              d={line(k)}
              fill="none"
              className={ca.colourSafe ? undefined : "stroke-accent"}
              style={ca.colourSafe ? { stroke: cvd(k) } : { strokeOpacity: STRENGTH[k] ?? 0.14 }}
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
              {ca.colourSafe ? (
                <span className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2" style={{ clipPath: markerClip(markerShape(k)), backgroundColor: cvd(k), outline: "none" }} />
              ) : (
                <span
                  className="absolute left-0 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface"
                  style={{ opacity: k === 0 ? 1 : 0.75 }}
                />
              )}
            </motion.span>
          ))}
        </motion.div>
      </div>
      <div className="flex justify-between text-[0.6875rem] text-muted" aria-hidden>
        {labels.map((l, i) => (i % Math.ceil((n - 1) / 4) === 0 || i === n - 1 ? <span key={l} className="whitespace-nowrap">{l}</span> : null))}
      </div>
    </ChartShell>
  );
}
