import { useRef, useState } from "react";
import { motion } from "motion/react";
import { easeInOut, springFirm } from "../../motion";
import { announce } from "../accessibility/announce";
import { ChartShell, chartA11yLabels, cvd, markerClip, markerShape, rovingNext, summariseSeries, useChartA11y, type ChartA11yLabels, type ChartA11yProps } from "./ChartA11y";

export type LinePoint = { label: string; value: number };

export type LineChartProps = {
  data: LinePoint[];
  /** A faint comparison series (last period), drawn in grey. */
  compare?: number[];
  height?: number;
  format?: (v: number) => string;
  title: string;
  className?: string;
  /** Override the accessibility text (table button, summary). Merged over `chartA11yLabels`. */
  labels?: Partial<ChartA11yLabels>;
} & ChartA11yProps;

/** A line that draws itself in once in view, with a scrubbing readout. */
export function LineChart({ data, compare, height = 200, format = String, title, className, labels, accessibilityFeatures, tableToggle }: LineChartProps) {
  const l = { ...chartA11yLabels, ...labels };
  const ca = useChartA11y({ accessibilityFeatures, tableToggle });
  // `at` is the last spot shown, so the marker fades out where it was; `jump` skips travel on re-entry.
  const [cursor, setCursor] = useState({ hover: null as number | null, at: data.length - 1, jump: false });
  const { hover, at: lastAt, jump } = cursor;
  const setHover = (v: number | null | ((h: number | null) => number | null)) =>
    setCursor((s) => {
      const next = typeof v === "function" ? v(s.hover) : v;
      return next === s.hover ? s : { hover: next, at: next ?? s.at, jump: next != null && s.hover == null };
    });
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

  const shown = lastAt;
  const readout = data[hover ?? data.length - 1];
  return (
    <ChartShell
      ca={ca}
      title={title}
      summary={summariseSeries(l, data.map((d) => d.label), data.map((d) => d.value), format)}
      table={{
        caption: title,
        columns: compare ? [l.label, l.value, l.compare] : [l.label, l.value],
        rows: data.map((d, i) => (compare ? [d.label, format(d.value), format(compare[i])] : [d.label, format(d.value)])),
      }}
      labels={labels}
      className={className}
      figureClassName="w-full"
      bodyClassName="flex w-full flex-col gap-2"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.8125rem] text-muted">{readout.label}</span>
        <span className="tabular text-sm font-medium text-ink">{format(readout.value)}</span>
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
          if (e.target === e.currentTarget && e.currentTarget.matches(":focus-visible")) setHover((h) => h ?? data.length - 1);
        }}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          const n = rovingNext(e.key, hover ?? data.length - 1, data.length, { prev: ["ArrowLeft"], next: ["ArrowRight"] });
          if (n == null) return;
          e.preventDefault();
          setHover(n);
          announce(`${data[n].label}: ${format(data[n].value)}`);
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
            className={ca.colourSafe ? undefined : "stroke-accent"}
            style={ca.colourSafe ? { stroke: cvd(0) } : undefined}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </motion.svg>
        {ca.colourSafe && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {compare?.map((v, i) => (
              <span key={`c${i}`} className="absolute size-2 -translate-x-1/2 -translate-y-1/2 bg-ink" style={{ left: `${(i / (data.length - 1)) * 100}%`, top: `${(y(v) / H) * 100}%`, clipPath: markerClip(markerShape(1)) }} />
            ))}
            {data.map((d, i) => (
              <span key={d.label} className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(i / (data.length - 1)) * 100}%`, top: `${(y(d.value) / H) * 100}%`, clipPath: markerClip(markerShape(0)), backgroundColor: cvd(0) }} />
            ))}
          </div>
        )}
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
      <div className="flex justify-between text-[0.6875rem] text-muted" aria-hidden>
        {data.map((d, i) =>
          i % Math.ceil((data.length - 1) / 4) === 0 || i === data.length - 1 ? <span key={d.label} className="whitespace-nowrap">{d.label}</span> : null,
        )}
      </div>
    </ChartShell>
  );
}
