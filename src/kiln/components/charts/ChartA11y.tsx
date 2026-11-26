import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useA11yProps, type A11yFeatures, type AccessibilityFeaturesProp } from "../../a11y";
import { Button } from "../buttons/Button";

/* Shared by every chart: an auto summary, a real data table (read by screen readers, or shown behind
   a "View as table" button), patterns and marker shapes for colour-safe mode, and the colour-safe
   palette. Nothing here changes how a chart looks until `colourSafe`, `tableToggle` or
   `screenReaderHints` is on. */

/** Text used by the charts' accessibility layer. Pass a partial via a chart's `labels` to translate or reword. */
export interface ChartA11yLabels {
  /** The button that swaps the chart for its data table. */
  viewAsTable: string;
  /** The same button while the table shows. */
  viewAsChart: string;
  /** Table heading for the first column when it has no better name. */
  label: string;
  from: string;
  to: string;
  value: string;
  share: string;
  total: string;
  /** Table heading for the comparison series of a line chart. */
  compare: string;
  /** Tells keyboard users how to move through the points. */
  keysHint: string;
  /** One sentence about a series: range, highest, lowest, direction. */
  series: (p: { count: number; first: string; last: string; max: string; maxAt: string; min: string; minAt: string; trend: "up" | "down" | "flat"; change: string }) => string;
  /** One sentence about parts of a whole. */
  parts: (p: { count: number; total: string; largest: string; largestValue: string; largestShare: string; smallest: string; smallestValue: string }) => string;
  /** One sentence about a funnel. */
  stages: (p: { count: number; first: string; firstValue: string; last: string; lastValue: string; overall: string }) => string;
  /** One sentence about a meter. */
  meter: (p: { label: string; value: string; min: string; max: string; target?: string }) => string;
}

export const chartA11yLabels: ChartA11yLabels = {
  viewAsTable: "View as table",
  viewAsChart: "View as chart",
  label: "Label",
  from: "From",
  to: "To",
  value: "Value",
  share: "Share",
  total: "Total",
  compare: "Previous period",
  keysHint: "Use the arrow keys to move between points, Home and End to jump to the first or last.",
  series: (p) =>
    `${p.count} points from ${p.first} to ${p.last}. Highest ${p.max} at ${p.maxAt}, lowest ${p.min} at ${p.minAt}. ${p.trend === "flat" ? "No overall change" : `${p.trend === "up" ? "Up" : "Down"} ${p.change}`} from first to last.`,
  parts: (p) => `${p.count} parts, ${p.total} in all. Largest ${p.largest}, ${p.largestValue} (${p.largestShare}). Smallest ${p.smallest}, ${p.smallestValue}.`,
  stages: (p) => `${p.count} stages. ${p.first} ${p.firstValue} down to ${p.last} ${p.lastValue}, ${p.overall} of the first stage.`,
  meter: (p) => `${p.label}: ${p.value}, on a scale from ${p.min} to ${p.max}.${p.target ? ` Target ${p.target}.` : ""}`,
};

export type ChartA11yProps = {
  /** Add accessibility support for this chart only (profiles or features); it never removes what the person chose. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
  /** Show a "View as table" button above the chart. It is also shown when the `screenReaderHints` feature is on. */
  tableToggle?: boolean;
};

/** Effective accessibility for one chart. `colourSafe` switches to the colour-safe palette, patterns and markers. */
export function useChartA11y({ accessibilityFeatures, tableToggle }: ChartA11yProps) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return { a11y: a11y as A11yFeatures, rootProps, colourSafe: a11y.colourSafe, toggle: !!tableToggle || a11y.screenReaderHints, uid };
}
export type ChartA11y = ReturnType<typeof useChartA11y>;

/** Sums, extremes and direction of a series, as a sentence. */
export function summariseSeries(l: ChartA11yLabels, labels: string[], values: number[], format: (v: number) => string) {
  const max = Math.max(...values), min = Math.min(...values);
  const diff = values[values.length - 1] - values[0];
  return l.series({
    count: values.length,
    first: labels[0],
    last: labels[labels.length - 1],
    max: format(max),
    maxAt: labels[values.indexOf(max)],
    min: format(min),
    minAt: labels[values.indexOf(min)],
    trend: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
    change: format(Math.abs(diff)),
  });
}

/** Largest and smallest part of a whole, as a sentence. */
export function summariseParts(l: ChartA11yLabels, items: { label: string; value: number }[], format: (v: number) => string) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const big = sorted[0], small = sorted[sorted.length - 1];
  return l.parts({
    count: items.length,
    total: format(total),
    largest: big.label,
    largestValue: format(big.value),
    largestShare: `${Math.round((big.value / total) * 100)}%`,
    smallest: small.label,
    smallestValue: format(small.value),
  });
}

/* ---------- Patterns ---------- */

const MARK = "color-mix(in srgb, var(--k-surface) 64%, transparent)";
export const PATTERN_COUNT = 8;
/** Colour-safe series colour, 0-based, wrapping after eight. */
export const cvd = (i: number) => `var(--k-cvd-${(i % PATTERN_COUNT) + 1})`;

const PATTERN_IMAGE = [
  `repeating-linear-gradient(45deg, ${MARK} 0 2px, transparent 2px 6px)`,
  `radial-gradient(${MARK} 1.2px, transparent 1.7px)`,
  `repeating-linear-gradient(0deg, ${MARK} 0 2px, transparent 2px 6px)`,
  `repeating-linear-gradient(45deg, ${MARK} 0 1.5px, transparent 1.5px 7px), repeating-linear-gradient(-45deg, ${MARK} 0 1.5px, transparent 1.5px 7px)`,
  `repeating-linear-gradient(90deg, ${MARK} 0 2px, transparent 2px 6px)`,
  `conic-gradient(${MARK} 25%, transparent 0 50%, ${MARK} 0 75%, transparent 0)`,
  `repeating-linear-gradient(-45deg, ${MARK} 0 2px, transparent 2px 6px)`,
  `repeating-linear-gradient(0deg, ${MARK} 0 1.5px, transparent 1.5px 7px), repeating-linear-gradient(90deg, ${MARK} 0 1.5px, transparent 1.5px 7px)`,
];
const PATTERN_SIZE = ["auto", "6px 6px", "auto", "auto", "auto", "8px 8px", "auto", "auto"];

/** CSS for an HTML element drawn in series `i`'s colour-safe colour with its pattern. */
export function patternStyle(i: number): CSSProperties {
  const k = i % PATTERN_COUNT;
  return { backgroundColor: cvd(k), backgroundImage: PATTERN_IMAGE[k], backgroundSize: PATTERN_SIZE[k] };
}

/** `<pattern>` definitions for SVG charts: render once inside the `<svg>`, then fill with `patternUrl(id, i)`. `size` is the tile in the SVG's own units. */
export function ChartPatternDefs({ id, size = 3 }: { id: string; size?: number }) {
  const s = size, t = s / 3;
  const tile = (i: number, rotate: number | null, content: ReactNode) => (
    <pattern key={i} id={`${id}-${i}`} patternUnits="userSpaceOnUse" width={s} height={s} patternTransform={rotate == null ? undefined : `rotate(${rotate})`}>
      <rect width={s} height={s} style={{ fill: cvd(i) }} />
      <g style={{ fill: MARK }}>{content}</g>
    </pattern>
  );
  return (
    <defs>
      {tile(0, 45, <rect width={t} height={s} />)}
      {tile(1, null, <circle cx={s / 2} cy={s / 2} r={s * 0.2} />)}
      {tile(2, null, <rect width={s} height={t} />)}
      {tile(3, 45, <><rect width={t * 0.8} height={s} /><rect width={s} height={t * 0.8} /></>)}
      {tile(4, null, <rect width={t} height={s} />)}
      {tile(5, null, <><rect width={s / 2} height={s / 2} /><rect x={s / 2} y={s / 2} width={s / 2} height={s / 2} /></>)}
      {tile(6, -45, <rect width={t} height={s} />)}
      {tile(7, null, <><rect width={t * 0.8} height={s} /><rect width={s} height={t * 0.8} /></>)}
    </defs>
  );
}
export const patternUrl = (id: string, i: number) => `url(#${id}-${i % PATTERN_COUNT})`;

/* ---------- Marker shapes ---------- */

export type MarkerShape = "circle" | "square" | "triangle" | "diamond" | "cross" | "triangleDown" | "hexagon" | "pentagon";
const SHAPES: MarkerShape[] = ["circle", "square", "triangle", "diamond", "cross", "triangleDown", "hexagon", "pentagon"];
/** Marker shape for series `i`, so two series never differ by colour alone. */
export const markerShape = (i: number): MarkerShape => SHAPES[i % SHAPES.length];

const POLY: Record<Exclude<MarkerShape, "circle">, number[][]> = {
  square: [[10, 10], [90, 10], [90, 90], [10, 90]],
  triangle: [[50, 6], [96, 90], [4, 90]],
  diamond: [[50, 0], [100, 50], [50, 100], [0, 50]],
  cross: [[35, 0], [65, 0], [65, 35], [100, 35], [100, 65], [65, 65], [65, 100], [35, 100], [35, 65], [0, 65], [0, 35], [35, 35]],
  triangleDown: [[4, 10], [96, 10], [50, 94]],
  hexagon: [[25, 5], [75, 5], [100, 50], [75, 95], [25, 95], [0, 50]],
  pentagon: [[50, 0], [100, 38], [82, 100], [18, 100], [0, 38]],
};

/** `clip-path` that turns a square HTML element into this marker shape. */
export function markerClip(shape: MarkerShape) {
  return shape === "circle" ? "circle(50%)" : `polygon(${POLY[shape].map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
}

/** A marker centred on (x, y) inside an SVG. `size` is its width in the SVG's units. */
export function MarkerGlyph({ shape, x, y, size, className, style }: { shape: MarkerShape; x: number; y: number; size: number; className?: string; style?: CSSProperties }) {
  if (shape === "circle") return <circle cx={x} cy={y} r={size / 2} className={className} style={style} />;
  const pts = POLY[shape].map(([px, py]) => `${(x + ((px - 50) / 100) * size).toFixed(2)},${(y + ((py - 50) / 100) * size).toFixed(2)}`).join(" ");
  return <polygon points={pts} className={className} style={style} />;
}

/** A small HTML marker (legend swatch, readout) in series `i`'s shape and colour-safe colour. */
export function MarkerSwatch({ shape, i, className }: { shape: MarkerShape; i: number; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0", className)} style={{ clipPath: markerClip(shape), backgroundColor: cvd(i) }} />;
}

/* ---------- Data table ---------- */

export type ChartTable = { caption: string; columns: string[]; rows: (string | number)[][] };

/** A real table of the chart's numbers. Screen-reader-only unless `visible`. The first column heads each row. */
export function ChartDataTable({ table, visible, className }: { table: ChartTable; visible: boolean; className?: string }) {
  const body = (
    <table className="w-full min-w-[240px] border-separate border-spacing-0 text-sm">
      <caption className="sr-only">{table.caption}</caption>
      <thead>
        <tr className="text-muted">
          {table.columns.map((c, i) => (
            <th key={c + i} scope="col" className={cn("h-10 border-b border-line px-4 font-medium", i === 0 ? "text-left" : "text-right")}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((r, ri) => (
          <tr key={ri}>
            {r.map((cell, ci) => {
              const edge = "h-10 border-b border-line px-4 [tr:last-child_&]:border-b-0";
              return ci === 0 ? (
                <th key={ci} scope="row" className={cn(edge, "text-left font-medium text-ink")}>{cell}</th>
              ) : (
                <td key={ci} className={cn(edge, "tabular text-right text-ink")}>{cell}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
  if (!visible) return <div className="sr-only">{body}</div>;
  return <div className={cn("w-full overflow-x-auto rounded-card border border-line", className)}>{body}</div>;
}

/* ---------- Shell ---------- */

/**
 * The figure round every chart: names it, describes it in one sentence, keeps its data table for
 * screen readers, and (with `tableToggle` or `screenReaderHints`) offers "View as table", swapping
 * the chart for the table with a fade. `bodyClassName` is the chart's own layout.
 */
export function ChartShell({
  ca, title, summary, table, labels, className, figureClassName, bodyClassName, children,
}: {
  ca: ChartA11y;
  title: string;
  summary: string;
  table: ChartTable;
  labels?: Partial<ChartA11yLabels>;
  className?: string;
  /** Base classes for the figure itself (before `className`). */
  figureClassName?: string;
  /** Layout of the chart's content. */
  bodyClassName?: string;
  children: ReactNode;
}) {
  const l = { ...chartA11yLabels, ...labels };
  const [asTable, setAsTable] = useState(false);
  const summaryId = `${ca.uid}-summary`;
  const { style, ...attrs } = ca.rootProps;
  return (
    <figure {...attrs} style={style} role="figure" aria-label={title} aria-describedby={summaryId} className={cn("relative", figureClassName, className)}>
      <p id={summaryId} className="sr-only">{summary}</p>
      {ca.toggle ? (
        <>
          <div className="mb-2 flex justify-end">
            <Button size="sm" variant="ghost" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>
              {asTable ? l.viewAsChart : l.viewAsTable}
            </Button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {asTable ? (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
                <ChartDataTable table={table} visible />
              </motion.div>
            ) : (
              <motion.div key="chart" className={bodyClassName} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
                {children}
              </motion.div>
            )}
          </AnimatePresence>
          {!asTable && <ChartDataTable table={table} visible={false} />}
        </>
      ) : (
        <>
          <div className={bodyClassName}>{children}</div>
          <ChartDataTable table={table} visible={false} />
        </>
      )}
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}

/** Move a roving index with the arrow keys, Home and End. Returns the new index, or null when the key is not one of them. */
export function rovingNext(key: string, i: number, n: number, keys: { prev: string[]; next: string[] } = { prev: ["ArrowLeft", "ArrowUp"], next: ["ArrowRight", "ArrowDown"] }) {
  if (keys.prev.includes(key)) return Math.max(0, i - 1);
  if (keys.next.includes(key)) return Math.min(n - 1, i + 1);
  if (key === "Home") return 0;
  if (key === "End") return n - 1;
  return null;
}
